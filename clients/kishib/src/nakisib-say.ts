// What Kišib says about Nakišib, its offline companion: shared by Kišib's
// code and its page (which imports nothing else of Kišib's code).

/**
 * Said beside each way with Nakišib (decided by Nobody, allegedly, 23 October 2026: "Kišib can
 * still do all it does, for user who wish for an extra layer of safety there is now a compagnon
 * app"): what the offline way protects, and that it is optional.
 */
export const NAKISIB_SAY = [
  'With Nakišib, the chain key never touches a connected device: your paper is typed only on an offline Mac that never connects, where Nakišib reads the request, shows its own summary, draws the new paper and signs. Kišib carries the request there and the answer back, by a file on a USB stick, and sends it to the homes.',
  'Optional: Kišib’s own way, the paper typed here, stays as it is. Nakišib is an extra layer of safety for whoever wants it.',
];

/** Said while Kišib waits for Nakišib's answer. */
export const NAKISIB_WAIT_SAY = [
  'Nothing is signed yet. Write the request to the USB stick, carry it to the offline Mac, and open it in Nakišib (“Change keys”). Nakišib takes your paper there, draws the new paper, and signs on SIGN; then carry its answer back here: “Read Nakišib’s answer”.',
  'Keep Kišib open meanwhile: it holds the new signing key it made for this change, and shows its words once the homes accept the change.',
];

/** Said where Nakišib's answer is read after Kišib was closed: the signing key made with the request is gone. */
export const NAKISIB_LOST_SAY =
  'Kišib was closed after it wrote this request, so the new signing key it made then is gone. Nakišib signed with your paper for this request alone and signs no other with it: this change is sent as it is, and installs a signing key nobody holds. Once the homes accept it, change the keys again, from the new paper Nakišib drew: that change installs a key you hold.';
