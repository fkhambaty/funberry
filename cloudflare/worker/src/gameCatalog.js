const ZONE_GAMES = {
  plants: "plants-book-nep-how-we-learn plants-pixi-tidy-room plants-eco-smart-three-rs plants-ch1-types-sort plants-photosynthesis-facts plants-ch2-part-we-eat plants-parts-quiz plants-sort plants-match plants-sequence plants-odd-garden plants-true-false plants-color-flower plants-bubble-pop",
  animals: "animals-book-ch3-read animals-pixi-helpful-lab animals-pixi-word-smart animals-book-ch3-true-false animals-book-how-they-help animals-book-load-and-farm animals-book-word-smart animals-ch4-wild-facts animals-food-habits-sort animals-wild-pet-sort animals-sounds-quiz animals-baby-match animals-life-sequence animals-word-picture animals-story-lost-puppy animals-bubble-pop animals-star-catcher",
  "about-me": "aboutme-body-quiz aboutme-senses-sort aboutme-feelings-match aboutme-odd-senses aboutme-true-false-body aboutme-word-body aboutme-spot-senses aboutme-star-catcher aboutme-feelings-bubble",
  "others-in-my-world": "others-minerals-match others-pixi-rocks-hard-soft others-who-helps-quiz others-family-sort others-helpers-match others-odd-out others-true-false",
  food: "food-nutrient-groups-sort food-book-mcq food-healthy-junk-sort food-where-grows-quiz food-groups-match food-odd-out food-true-false food-bubble-pop food-star-catcher",
  water: "water-ch10-living-things water-cycle-sequence water-states-quiz water-uses-sort water-save-sequence water-quiz water-odd-out water-true-false",
  shelter: "shelter-permanent-movable shelter-why-home-tf shelter-houses-quiz shelter-build-sequence shelter-animal-homes-match shelter-odd-out shelter-true-false",
  clothing: "clothing-season-sort clothing-fabric-match clothing-wear-quiz clothing-odd-out clothing-true-false",
  air: "air-clean-dirty-sort air-pixi-wind-glide air-ch9-mcq air-needs-sort air-wind-sequence air-quiz air-odd-out air-true-false",
  "health-safety": "health-first-aid-order health-safety-book-mcq health-good-habits-quiz health-safety-signs-match health-daily-routine-sequence hs-odd-out hs-true-false health-bubble-pop",
  neighbourhood: "neighbourhood-waste-sort neighbourhood-places-quiz neighbourhood-helpers-match neighbourhood-school-sequence neigh-odd-out neigh-true-false",
  transport: "transport-medium-sort transport-traffic-quiz transport-journey-sequence transport-odd-out transport-true-false transport-star-catcher",
  communication: "communication-old-new-sort communication-letter-sequence communication-quiz comm-odd-out comm-true-false",
  "sun-moon-stars": "sunmoon-light-shadow-facts sunmoon-day-night-sort sunmoon-phases-sequence sunmoon-space-quiz sms-odd-out sms-true-false",
  "time-space-direction": "timespace-compass-rose timespace-clock-quiz timespace-left-right-quiz timespace-my-day-sequence tsd-odd-out tsd-true-false",
  computers: "computers-term-quick-quiz computers-term-device-sort computers-term-true-false computers-term-ipo-cycle computers-term-word-grid computers-term-recap-challenge computers-notes-smart-machines computers-notes-ipo-mission computers-notes-ipo-meaning computers-notes-core-quiz computers-notes-device-facts computers-notes-ipo-sort computers-notes-input-pair computers-notes-ai-quiz computers-notes-ai-boss computers-revision-device-detective computers-revision-ai-detective computers-ws1-device-quiz computers-ws1-fact-boss computers-ai-notes-facts computers-ai-notes-boss computers-ws2-fill-ups computers-ws2-fact-boss computers-ai-ws-fill-ups computers-ai-ws-boss",
};

const STARS_TO_UNLOCK = {
  "about-me": 0,
  "others-in-my-world": 5,
  food: 10,
  water: 15,
  shelter: 20,
  clothing: 25,
  air: 30,
  "health-safety": 35,
  neighbourhood: 40,
  plants: 0,
  animals: 0,
  transport: 50,
  communication: 55,
  "sun-moon-stars": 60,
  "time-space-direction": 65,
  computers: 0,
};

const GAME_ZONE = new Map(
  Object.entries(ZONE_GAMES).flatMap(([zone, ids]) => ids.split(" ").map((id) => [id, zone])),
);

export function gameEntitlement(gameId, totalStars, premium) {
  const zone = GAME_ZONE.get(String(gameId || ""));
  if (!zone) return { allowed: false, reason: "unknown" };
  const threshold = STARS_TO_UNLOCK[zone];
  return {
    allowed: premium || threshold === 0 || Number(totalStars || 0) >= threshold,
    reason: premium || threshold === 0 || Number(totalStars || 0) >= threshold ? "allowed" : "locked",
    zone,
  };
}
