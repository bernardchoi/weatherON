import assert from "node:assert/strict";
import { handleWardrobeRoute } from "../apps/server/src/wardrobeCore.mjs";

const expectedAnalysis = {
  name: "검정 경량 재킷",
  category: "outer",
  seasons: ["spring", "fall"],
  purposes: ["commute", "daily"],
  weatherTags: ["wind", "dry"],
  confidence: 0.86,
  quality: "good",
  issues: [],
  reason: "얇은 겉옷으로 보임",
};

let sessionChecks = 0;
let integrityChecks = 0;
let aiInput;
const env = {
  WEATHERON_DB: {},
  AI: {
    async run(model, input) {
      assert.equal(model, "@cf/moondream/moondream3.1-9B-A2B");
      aiInput = input;
      return { answer: `\n\`\`\`json\n${JSON.stringify(expectedAnalysis)}\n\`\`\`` };
    },
  },
};
const dependencies = {
  async requireSession() {
    sessionChecks += 1;
    return { userId: "weatheron-user" };
  },
  async verifyAppIntegrityRequest(_request, _database, _env, context) {
    integrityChecks += 1;
    assert.equal(context.routeKey, "POST /wardrobe/analyze");
    assert.equal(context.session.userId, "weatheron-user");
  },
};

const imageBase64 = Buffer.from("weatheron-wardrobe-image-for-analysis").toString("base64");
const success = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/jpeg" }),
  env,
  dependencies,
);
assert.equal(success.status, 200);
assert.deepEqual(success.payload.analysis, expectedAnalysis);
assert.equal(sessionChecks, 1);
assert.equal(integrityChecks, 1);
assert.equal(aiInput.task, "query");
assert.equal(aiInput.reasoning, false);
assert.equal(aiInput.image, `data:image/jpeg;base64,${imageBase64}`);
assert.match(aiInput.question, /Return only one valid JSON object/u);

const invalidImage = await handleWardrobeRoute(
  request({ imageBase64: "invalid", mimeType: "image/jpeg" }),
  env,
  dependencies,
);
assert.equal(invalidImage.status, 400);
assert.equal(invalidImage.payload.error, "invalid_image");

const missingAi = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/jpeg" }),
  { WEATHERON_DB: {} },
  dependencies,
);
assert.equal(missingAi.status, 503);
assert.equal(missingAi.payload.error, "wardrobe_ai_unavailable");

const invalidModelOutput = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/jpeg" }),
  { WEATHERON_DB: {}, AI: { run: async () => ({ answer: "not-json" }) } },
  dependencies,
);
assert.equal(invalidModelOutput.status, 502);
assert.equal(invalidModelOutput.payload.error, "invalid_ai_response");

console.log("Wardrobe photo analysis checks passed.");

function request(body) {
  return new Request("https://weatheron-api.test/wardrobe/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
