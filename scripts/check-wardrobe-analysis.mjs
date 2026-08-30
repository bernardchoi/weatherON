import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { handleWardrobeRoute } from "../apps/server/src/wardrobeCore.mjs";

const imageBase64 = "/9j/4AAQSkZJRgABAQAAZABkAAD/4QCARXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABkAAAAAQAAAGQAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABCgAwAEAAAAAQAAAAkAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIAAkAEAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAICAgICAgMCAgMFAwMDBQYFBQUFBggGBgYGBggKCAgICAgICgoKCgoKCgoMDAwMDAwODg4ODg8PDw8PDw8PDw//2wBDAQICAgQEBAcEBAcQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/3QAEAAH/2gAMAwEAAhEDEQA/APy9uk07XND0ZLl7LT2sIDF/oll5c02WzuuJFP72T0Y9uKpWV5ofh/Std026sLTWZ9TjWK1uXLrLZlST5iKVHLAjv2AzgkHi0+6Kgf7xr9ExGFjVjyTvbR6O2zutVZ7rvZ7PQ+VpV5QfNHf791brof/Z";
const imageDigest = createHash("sha256").update(imageBase64).digest("hex");
const headerOnlyJpegBase64 = Buffer.from([
  0xff, 0xd8,
  0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x20, 0x00, 0x30, 0x03,
  0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
  0xff, 0xd9,
]).toString("base64");

const acceptedFact = {
  subjectType: "wardrobe_item",
  itemCount: "single",
  pairKind: "none",
  realPersonPresent: "no",
  sensitiveContent: "no",
  gateConfidence: 0.96,
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

const accepted = await run([`
\`\`\`json
${JSON.stringify(acceptedFact)}
\`\`\``]);
assert.equal(accepted.result.status, 200);
assert.deepEqual(accepted.result.payload.analysis, {
  decision: "accept",
  policyVersion: "wardrobe-photo-ios-1",
  photoDigest: imageDigest,
  eligibilityConfidence: 0.96,
  name: "검정 경량 재킷",
  category: "outer",
  seasons: ["spring", "fall"],
  purposes: ["commute", "daily"],
  weatherTags: ["wind", "dry"],
  confidence: 0.86,
  quality: "good",
  issues: [],
  reason: "얇은 겉옷으로 보임",
});
assert.equal(accepted.aiCalls.length, 1);
assert.match(accepted.aiCalls[0].input.question, /Do not make the final product allow or reject decision/u);
assert.equal(accepted.integrityBodies[0], JSON.stringify({ imageBase64, mimeType: "image/jpeg" }));

const pairOfShoes = await run([{ ...acceptedFact, itemCount: "pair", pairKind: "shoes", category: "shoes", name: "운동화 한 켤레" }]);
assert.equal(pairOfShoes.result.status, 200);

const pairOfGloves = await run([{ ...acceptedFact, itemCount: "pair", pairKind: "gloves", category: "accessory", name: "장갑 한 켤레" }]);
assert.equal(pairOfGloves.result.status, 200);

const unrelatedAccessoryPair = await run([
  { ...acceptedFact, itemCount: "pair", pairKind: "none", category: "accessory" },
  { ...acceptedFact, itemCount: "pair", pairKind: "none", category: "accessory" },
]);
assert.equal(unrelatedAccessoryPair.result.status, 422);
assert.equal(unrelatedAccessoryPair.result.payload.error, "photo_review_required");

const mannequin = await run([{ ...acceptedFact, realPersonPresent: "no", reason: "마네킹에 걸친 재킷" }]);
assert.equal(mannequin.result.status, 200);

const incompleteAttributes = await run([{
  ...acceptedFact,
  category: null,
  seasons: [],
  purposes: [],
  weatherTags: [],
}]);
assert.equal(incompleteAttributes.result.status, 200);
assert.equal(incompleteAttributes.result.payload.analysis.category, "top");
assert.deepEqual(incompleteAttributes.result.payload.analysis.seasons, ["spring", "summer", "fall", "winter"]);
assert.deepEqual(incompleteAttributes.result.payload.analysis.purposes, ["daily"]);
assert.deepEqual(incompleteAttributes.result.payload.analysis.weatherTags, ["dry"]);
assert.equal(incompleteAttributes.result.payload.analysis.quality, "review");
assert.match(incompleteAttributes.result.payload.analysis.issues.join(" "), /기본값/u);

const lowerConfidenceAccepted = await run([
  { ...acceptedFact, gateConfidence: 0.74 },
  { ...acceptedFact, subjectType: "uncertain", itemCount: "uncertain", gateConfidence: 0.48 },
  { ...acceptedFact, gateConfidence: 0.81 },
]);
assert.equal(lowerConfidenceAccepted.result.status, 200);
assert.equal(lowerConfidenceAccepted.aiCalls.length, 3);

const oneSidedApproval = await run([
  { ...acceptedFact, gateConfidence: 0.74 },
  { ...acceptedFact, subjectType: "uncertain", itemCount: "uncertain", gateConfidence: 0.48 },
  { ...acceptedFact, subjectType: "uncertain", itemCount: "uncertain", gateConfidence: 0.51 },
]);
assert.equal(oneSidedApproval.result.status, 422);
assert.equal(oneSidedApproval.result.payload.error, "photo_review_required");

const invalidPairCannotConfirmApproval = await run([
  { ...acceptedFact, gateConfidence: 0.74 },
  { ...acceptedFact, itemCount: "pair", pairKind: "none", category: "accessory", gateConfidence: 0.86 },
  { ...acceptedFact, itemCount: "pair", pairKind: "none", category: "accessory", gateConfidence: 0.88 },
]);
assert.equal(invalidPairCannotConfirmApproval.result.status, 422);
assert.equal(invalidPairCannotConfirmApproval.result.payload.error, "photo_review_required");

const lowerConfidenceConflict = await run([
  { ...acceptedFact, gateConfidence: 0.74 },
  { ...acceptedFact, subjectType: "non_wardrobe", gateConfidence: 0.96 },
]);
assert.equal(lowerConfidenceConflict.result.status, 422);
assert.equal(lowerConfidenceConflict.result.payload.error, "photo_review_required");

const nonClothing = { ...acceptedFact, subjectType: "non_wardrobe", gateConfidence: 0.98 };
const rejectedObject = await run([nonClothing, nonClothing]);
assert.equal(rejectedObject.result.status, 422);
assert.equal(rejectedObject.result.payload.error, "photo_not_wardrobe");
assert.equal(rejectedObject.aiCalls.length, 2);
assert.match(rejectedObject.aiCalls[1].input.question, /Independently verify/u);

const personVisible = { ...acceptedFact, realPersonPresent: "yes", gateConfidence: 0.97 };
const rejectedPerson = await run([personVisible, personVisible]);
assert.equal(rejectedPerson.result.status, 422);
assert.equal(rejectedPerson.result.payload.error, "photo_person_detected");

const sensitiveContent = { ...acceptedFact, sensitiveContent: "yes", gateConfidence: 0.99 };
const rejectedSensitive = await run([sensitiveContent, sensitiveContent]);
assert.equal(rejectedSensitive.result.status, 422);
assert.equal(rejectedSensitive.result.payload.error, "photo_sensitive_content");

const disagreement = await run([nonClothing, acceptedFact]);
assert.equal(disagreement.result.status, 422);
assert.equal(disagreement.result.payload.error, "photo_review_required");

const personDisagreement = await run([personVisible, acceptedFact]);
assert.equal(personDisagreement.result.status, 422);
assert.equal(personDisagreement.result.payload.error, "photo_review_required");

const multipleItemsDisagreement = await run([{ ...acceptedFact, itemCount: "multiple" }, acceptedFact]);
assert.equal(multipleItemsDisagreement.result.status, 422);
assert.equal(multipleItemsDisagreement.result.payload.error, "photo_review_required");

const ambiguous = await run([
  { ...acceptedFact, itemCount: "uncertain", gateConfidence: 0.55 },
  { ...acceptedFact, itemCount: "uncertain", gateConfidence: 0.58 },
]);
assert.equal(ambiguous.result.status, 422);
assert.equal(ambiguous.result.payload.error, "photo_review_required");

const missingGateFields = await run([
  { name: "옷", category: "top", seasons: ["summer"], purposes: ["daily"], weatherTags: ["heat"] },
  { name: "옷", category: "top", seasons: ["summer"], purposes: ["daily"], weatherTags: ["heat"] },
]);
assert.equal(missingGateFields.result.status, 422);
assert.equal(missingGateFields.result.payload.error, "photo_review_required");

const invalidImage = await handleWardrobeRoute(
  request({ imageBase64: Buffer.from("not-a-jpeg-image-payload").toString("base64"), mimeType: "image/jpeg" }),
  makeEnv([acceptedFact]),
  makeDependencies(),
);
assert.equal(invalidImage.status, 400);
assert.equal(invalidImage.payload.error, "invalid_image");

const headerOnlyImage = await handleWardrobeRoute(
  request({ imageBase64: headerOnlyJpegBase64, mimeType: "image/jpeg" }),
  makeEnv([acceptedFact]),
  makeDependencies(),
);
assert.equal(headerOnlyImage.status, 400);
assert.equal(headerOnlyImage.payload.error, "invalid_image_dimensions");

const oversizedDimensionsBase64 = Buffer.from([
  0xff, 0xd8,
  0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x20, 0x10, 0x01, 0x03,
  0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
  0xff, 0xd9,
]).toString("base64");
const oversizedDimensions = await handleWardrobeRoute(
  request({ imageBase64: oversizedDimensionsBase64, mimeType: "image/jpeg" }),
  makeEnv([acceptedFact]),
  makeDependencies(),
);
assert.equal(oversizedDimensions.status, 400);
assert.equal(oversizedDimensions.payload.error, "invalid_image_dimensions");

const unsupportedImage = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/png" }),
  makeEnv([acceptedFact]),
  makeDependencies(),
);
assert.equal(unsupportedImage.status, 415);
assert.equal(unsupportedImage.payload.error, "unsupported_image_type");

const declaredOversize = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/jpeg" }, { "content-length": "1600001" }),
  makeEnv([acceptedFact]),
  makeDependencies(),
);
assert.equal(declaredOversize.status, 413);
assert.equal(declaredOversize.payload.error, "request_too_large");

const rateLimited = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/jpeg" }),
  makeEnv([acceptedFact], { WARDROBE_RATE_LIMITER: { limit: async () => ({ success: false }) } }),
  makeDependencies(),
);
assert.equal(rateLimited.status, 429);
assert.equal(rateLimited.payload.error, "wardrobe_rate_limited");

const dailyLimited = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/jpeg" }),
  makeEnv([acceptedFact]),
  makeDependencies({ consumeDailyBudget: async () => false }),
);
assert.equal(dailyLimited.status, 429);
assert.equal(dailyLimited.payload.error, "wardrobe_daily_limit_reached");

const missingAi = await handleWardrobeRoute(
  request({ imageBase64, mimeType: "image/jpeg" }),
  { WEATHERON_DB: {} },
  makeDependencies(),
);
assert.equal(missingAi.status, 503);
assert.equal(missingAi.payload.error, "wardrobe_ai_unavailable");

const invalidModelOutput = await run(["not-json"]);
assert.equal(invalidModelOutput.result.status, 502);
assert.equal(invalidModelOutput.result.payload.error, "invalid_ai_response");

console.log("Wardrobe photo policy-gate checks passed.");

async function run(outputs) {
  const aiCalls = [];
  const integrityBodies = [];
  const result = await handleWardrobeRoute(
    request({ imageBase64, mimeType: "image/jpeg" }),
    makeEnv(outputs, { aiCalls }),
    makeDependencies({ integrityBodies }),
  );
  return { result, aiCalls, integrityBodies };
}

function makeEnv(outputs, extras = {}) {
  const queue = [...outputs];
  return {
    WEATHERON_DB: {},
    ...extras,
    AI: {
      async run(model, input) {
        assert.equal(model, "@cf/moondream/moondream3.1-9B-A2B");
        extras.aiCalls?.push({ model, input });
        const answer = queue.shift();
        return { answer };
      },
    },
  };
}

function makeDependencies(overrides = {}) {
  return {
    async requireSession() {
      return { user_id: "weatheron-user", session_id: "weatheron-session" };
    },
    async verifyAppIntegrityRequest(requestToVerify, _database, _env, context) {
      assert.equal(context.routeKey, "POST /wardrobe/analyze");
      assert.equal(context.session.user_id, "weatheron-user");
      overrides.integrityBodies?.push(await requestToVerify.text());
    },
    consumeDailyBudget: async () => true,
    ...overrides,
  };
}

function request(body, headers = {}) {
  return new Request("https://weatheron-api.test/wardrobe/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
