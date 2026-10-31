import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from urllib.parse import urlsplit


def records(event):
    timestamp = event.get('eventTimestamp')
    request = event.get('event', {}).get('request', {})
    if urlsplit(request.get('url', '')).path == '/live-activities/departure':
        yield {'event': 'departure_registration_request', 'timestamp': timestamp,
               'method': request.get('method') if request.get('method') in ('POST', 'DELETE') else None,
               'status': event.get('event', {}).get('response', {}).get('status')}
    for log in event.get('logs', []):
        for message in log.get('message', []):
            try:
                value = json.loads(message) if isinstance(message, str) else message
            except (ValueError, TypeError):
                continue
            if not isinstance(value, dict) or value.get('event') not in {
                'departure_end_push', 'departure_end_retry', 'departure_end_expired'
            }:
                continue
            result = {'event': value['event'], 'timestamp': log.get('timestamp', timestamp)}
            if isinstance(value.get('status'), int):
                result['status'] = value['status']
            if value.get('environment') in ('production', 'development'):
                result['environment'] = value['environment']
            if isinstance(value.get('reason'), str) and re.fullmatch('[A-Za-z]{1,64}', value['reason']):
                result['reason'] = value['reason']
            yield result


assert list(records({'event': {'request': {'url': 'https://test/live-activities/departure?token=secret', 'method': 'POST'},
    'response': {'status': 200}}, 'logs': [{'message': [json.dumps({
        'event': 'departure_end_push', 'status': 200, 'pushToken': 'secret', 'reason': 'Bearer secret'
    })]}]})) == [
        {'event': 'departure_registration_request', 'timestamp': None, 'method': 'POST', 'status': 200},
        {'event': 'departure_end_push', 'timestamp': None, 'status': 200},
    ]

if '--self-test' in sys.argv:
    print('safe tail filter self-test passed')
    sys.exit(0)

print(json.dumps({'event': 'tail_start', 'timestamp': datetime.now(timezone.utc).isoformat()}), flush=True)
# Prevent Wrangler from persisting its unfiltered diagnostic log.
env = dict(os.environ, WRANGLER_LOG_PATH='/dev/null', WRANGLER_SEND_METRICS='false')
process = subprocess.Popen([
    'npm', 'exec', '--offline', '--cache', './.npm-cache', '--',
    'wrangler', 'tail', 'weatheron-api', '--format', 'json'
], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, env=env)
buffer = ''
try:
    for line in process.stdout:
        if not buffer and not line.lstrip().startswith('{'):
            continue
        buffer += line
        try:
            event = json.loads(buffer)
        except ValueError:
            continue
        buffer = ''
        for record in records(event):
            print(json.dumps(record), flush=True)
finally:
    process.terminate()
    print(json.dumps({'event': 'tail_stop', 'exit': process.wait(),
                      'timestamp': datetime.now(timezone.utc).isoformat()}), flush=True)
