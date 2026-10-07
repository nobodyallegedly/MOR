// ../genesis/wasm/mor_wasm.js
var Verifier = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    VerifierFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_verifier_free(ptr, 0);
  }
  /**
   * Hold a private act, opened with its content key.
   * @param {Uint8Array} bytes
   * @param {Uint8Array} key
   * @returns {string}
   */
  addWithKey(bytes, key) {
    let deferred4_0;
    let deferred4_1;
    try {
      const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
      const len1 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_addWithKey(this.__wbg_ptr, ptr0, len0, ptr1, len1);
      var ptr3 = ret[0];
      var len3 = ret[1];
      if (ret[3]) {
        ptr3 = 0;
        len3 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
  }
  /**
   * Hold an act. Returns its id. A malformed act is refused; a validly
   * shaped act with a bad signature is held and judged invalid.
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  add(bytes) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_add(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * The standing of an act for everything binding (keeper records,
   * payments, discharge of debts, agreements, forks, closings): as
   * `status`, except "unknown" where the answer rests on this client's
   * own failed attempts to reach homes ("re-homed without audit") or on
   * what it found at homes (`foundAtHome`), until it no longer does
   * (Identity, the sentence after rule 17, F153, F159).
   * Reading and following an identity use `status`.
   * @param {string} act
   * @returns {string}
   */
  bindingStatus(act) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_bindingStatus(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * Record that this client itself tried and failed to reach an operator's home.
   * @param {string} operator
   */
  failedToReach(operator) {
    const ptr0 = passStringToWasm0(operator, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_failedToReach(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * Record that this client found the act, in its sealed form, at the
   * home operated by `home` (the operator's identity hash; for a
   * self-hosted home, the identity itself). A private link act counts
   * only if found at a home its signer's chain names at its binding;
   * otherwise it is unknown, never invalid. What was found is this
   * client's own input: `bindingStatus` shows an answer resting on it
   * as unknown (Identity, "The envelope", F152, F159).
   * @param {string} act
   * @param {string} home
   */
  foundAtHome(act, home) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(home, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_foundAtHome(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * Every act held, by id.
   * @returns {string[]}
   */
  held() {
    const ret = wasm.verifier_held(this.__wbg_ptr);
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
  /**
   * The routes act (Identity type 3) or encryption-key act (Envelope type
   * 4) that counts for an identity: its valid acts of that spec and type,
   * followed from version 1 (Identity, "Routes"; Envelope, "Encryption
   * key"). Returns the act, whether the chain is contested past it, and
   * its payload as CBOR.
   * @param {string} identity
   * @param {string} spec
   * @param {number} type_
   * @returns {any}
   */
  latest(identity, spec, type_) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_latest(this.__wbg_ptr, ptr0, len0, ptr1, len1, type_);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * An agreement as held: its parties, who signed, whether it exists (a
   * deal, founding terms) or is ready to be recorded (a collective's
   * clone), and the powers its mark must name. `specs`: the six MIP
   * hashes, and the layers of extensions it adds or drops.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  lawAgreement(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawAgreement(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether an act under a grant binds the collective that issued it.
   * @param {any} specs
   * @param {string} act
   * @returns {any}
   */
  lawBacking(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawBacking(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether the collective's act `x` counts as made before the line
   * `line` (a record or a rotation of it), on its own sequences (F109).
   * @param {any} specs
   * @param {string} x
   * @param {string} line
   * @returns {boolean}
   */
  lawBefore(specs, x, line) {
    const ptr0 = passStringToWasm0(x, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(line, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawBefore(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * Whether a claim on a work is shown as made after its release: the
   * release, if so (F121, D).
   * @param {any} specs
   * @param {string} claim
   * @param {string} work
   * @returns {string | undefined}
   */
  lawClaimAfterRelease(specs, claim, work) {
    const ptr0 = passStringToWasm0(claim, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(work, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawClaimAfterRelease(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v3;
    if (ret[0] !== 0) {
      v3 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v3;
  }
  /**
   * A closing act, judged (rule 47a, F124 N9).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  lawClosing(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawClosing(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The collective whose genesis declares the root of `agreement`'s
   * lineage, where held: what null names in its terms (S1).
   * @param {any} specs
   * @param {string} agreement
   * @returns {string | undefined}
   */
  lawCollectiveOf(specs, agreement) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawCollectiveOf(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  /**
   * Law's answer for an act of a collective: which areas reach it, and
   * whether their holders' signature acts meet each (rule 36a, 44d).
   * @param {any} specs
   * @param {string} act
   * @returns {any}
   */
  lawConsent(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawConsent(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The collective's state after everything held under its latest key:
   * the agreement in force, who left, who stepped down from which area,
   * which areas are frozen, its records. Null if it is not a collective.
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  lawCurrent(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawCurrent(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A creditor's release, judged (Finance type 4, F126; rule 47b):
   * whether it ends the obligation it names (signed by that obligation's
   * creditor, a collective by its Finance lane).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  lawDebtRelease(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawDebtRelease(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Who owes an obligation of a collective a fork closed (N13): the
   * successors it assigns it to, every successor where it assigns it to
   * none (F125, D1); null where its debtor is not closed by a fork.
   * @param {any} specs
   * @param {string} id
   * @returns {string[] | undefined}
   */
  lawDebtors(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawDebtors(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    }
    return v2;
  }
  /**
   * The agreement an identity's chain declares at the chain act
   * `binding`, if any (for a rotation: the clone it declares).
   * @param {any} specs
   * @param {string} identity
   * @param {string} binding
   * @returns {string | undefined}
   */
  lawDeclared(specs, identity, binding) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(binding, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawDeclared(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v3;
    if (ret[0] !== 0) {
      v3 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v3;
  }
  /**
   * Whether an act in a collective's name is done (F126, F128): sealed to
   * every member, or public; where it is held decides nothing. `{ done,
   * why }`, or null where the act is not in a collective's name.
   * @param {any} specs
   * @param {string} act
   * @returns {any}
   */
  lawDone(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawDone(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Every fork and closing of `collective` held, complete or not: what a
   * new ending names in its `objects`, `[agreement, ending]` (F131 IT1,
   * client conformance).
   * @param {any} specs
   * @param {string} collective
   * @returns {string[]}
   */
  lawEndingActs(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawEndingActs(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * A fork of a collective, judged (rule 47a, F121 shape B, F124):
   * whether it closes the original, the members whose voice remains,
   * who signed and who leaves on no side, each side's default share, who
   * every successor keeps as a departed holder, each side's successor's
   * founding agreement where it fits, and the obligations in the history
   * it cites that it does not hand out, which keep it from taking effect
   * (F127, replacing F125 D1).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  lawFork(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawFork(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a fork of `collective` must hand out (F127), its line drawn at
   * `chain_act` and `tips` (`[{ act, position, summary }]`) with
   * `agreement` in force there: every obligation in the history it would
   * cite, its own and those an earlier fork handed to it. Null where the
   * line does not hold.
   * @param {any} specs
   * @param {string} collective
   * @param {string} agreement
   * @param {string} chain_act
   * @param {any} tips
   * @returns {string[] | undefined}
   */
  lawHandOut(specs, collective, agreement, chain_act, tips) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(chain_act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawHandOut(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, ptr2, len2, tips);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v4;
    if (ret[0] !== 0) {
      v4 = getArrayJsValueFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    }
    return v4;
  }
  /**
   * The agreement in force for an act of a collective (rule 37c, F109),
   * or null if its signer is not a collective.
   * @param {any} specs
   * @param {string} act
   * @returns {string | undefined}
   */
  lawInForce(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawInForce(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  /**
   * The acts the history a line at `chain_act` and `tips` would cite
   * that this verifier does not hold (F127): a member's client signs no
   * fork or closing while any is missing (F131 IT2b, client conformance).
   * @param {any} specs
   * @param {string} collective
   * @param {string} chain_act
   * @param {any} tips
   * @returns {string[]}
   */
  lawLineUnheld(specs, collective, chain_act, tips) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(chain_act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawLineUnheld(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, tips);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
  }
  /**
   * Whether an obligation binds its debtor: for a collective, once done
   * (F128, N13's public outside withdrawn); null if not one.
   * @param {any} specs
   * @param {string} id
   * @returns {boolean | undefined}
   */
  lawObligationBinds(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawObligationBinds(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] === 16777215 ? void 0 : ret[0] !== 0;
  }
  /**
   * What a collective owes now (F125, D5): its obligations that bind,
   * and those it owes as a fork's successor, neither paid in full by the
   * receipts held nor ended by a creditor's release.
   * @param {any} specs
   * @param {string} collective
   * @returns {string[]}
   */
  lawOwes(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawOwes(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * What is paid toward an obligation, as a binding answer: an error
   * coded `law/own-attempt` where it rests on this client's own failed
   * attempts to reach homes, shown as unknown (F153).
   * @param {any} specs
   * @param {string} id
   * @returns {bigint}
   */
  lawPaid(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawPaid(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return BigInt.asUintN(64, ret[0]);
  }
  /**
   * Payer-side splitting (F124 P2): what a paying wallet reading Law pays
   * each holder for `amount` on the stake in `object` (hex, or null for
   * the collective itself), or why it cannot. Leftovers by largest
   * remainder; a tied unit is the payer's to decide, at most one per tie
   * (Law rule 15a, F165, F168): this wallet gives it to the tied holder
   * with the smallest identity hash, a choice, not a rule.
   * @param {any} specs
   * @param {string} agreement
   * @param {string | null | undefined} object
   * @param {bigint} amount
   * @returns {any}
   */
  lawPayerSplit(specs, agreement, object, amount) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(object) ? 0 : passStringToWasm0(object, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawPayerSplit(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, amount);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The pointer check (rule 18, F123): whether the payee pointer of
   * `owners` counts for Law under `agreement`: "no-split-service",
   * "ordinary", "bypasses" (with the addresses no service's own pointer
   * carries, as hex) or "undetermined".
   * @param {any} specs
   * @param {string} owners
   * @param {string} agreement
   * @returns {any}
   */
  lawPointerCheck(specs, owners, agreement) {
    const ptr0 = passStringToWasm0(owners, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawPointerCheck(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The payee's pointer acts its own acts hold, for what a payment
   * follows (an obligation, an agreement or an offer; Finance rule 14,
   * F145, F157, F163, F168): `{ pointers, complete }`, or null where
   * `fulfils` is none of these.
   * @param {any} specs
   * @param {string} fulfils
   * @param {string} payee
   * @returns {any}
   */
  lawPointerHolding(specs, fulfils, payee) {
    const ptr0 = passStringToWasm0(fulfils, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawPointerHolding(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A payment for a work, judged (F126, F127 W2, F128 W4): "purchase",
   * "no-purchase" (a refund owed to the payer, with why), or "unrecorded"
   * (on a request rail, a collective seller's actions chain has not
   * recorded it yet; on a push rail (`specs.pushRails`), a holder has not
   * signed its receipt yet, or receipts of one payment name different
   * claims and the rail has not shown which the payment committed to),
   * or "wrong-receipt" (F131 IT3: a receipt `specs.railInvalid` names,
   * whose claim the payment did not commit to; it counts for nothing);
   * null where the payment is not for a work.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  lawPurchase(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawPurchase(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A record act of a collective, judged: whether it is a line, the
   * clone it names and whether it puts it in force, and what it registers.
   * @param {any} specs
   * @param {string} collective
   * @param {string} record
   * @returns {any}
   */
  lawRecord(specs, collective, record) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(record, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawRecord(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A public domain release, judged (rule 17, F121 shape D).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  lawRelease(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawRelease(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a split service owes (Law rule 29): every incoming receipt and
   * payer's claim without its split, and every payout without the
   * receiver's receipt, each naming one receiver and one agreement.
   * @param {any} specs
   * @param {string} service
   * @returns {any}
   */
  lawServiceAccount(specs, service) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawServiceAccount(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Rule 15a's turns (F165, F171): for `stake` (its index) of
   * `agreement`'s version in force, the leftover units each holder has
   * received so far from `service`'s splits, as `previous` (the
   * service's latest split act for the stake, which its next split
   * cites) carries them in its running count; null `previous`: no split
   * yet, every count zero. In the order of `holders` (hex). Null where
   * `previous` is not held, not one of the service's splits for the
   * stake, or carries no count.
   * @param {any} specs
   * @param {string} service
   * @param {string} agreement
   * @param {bigint} stake
   * @param {string[]} holders
   * @param {string | null} [previous]
   * @returns {Float64Array | undefined}
   */
  lawSplitTurns(specs, service, agreement, stake, holders, previous) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(holders, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawSplitTurns(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, stake, ptr2, len2, ptr3, len3);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v5;
    if (ret[0] !== 0) {
      v5 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
      wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    }
    return v5;
  }
  /**
   * A split, judged (rules 20, 21, 26; F121 Q9, F124 N10): whether it
   * sums to what arrived, each fee and who received it, the holders it
   * pays and was not delivered to, and every payout that does not match
   * its stake.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  lawSplit(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_lawSplit(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A link between two MOR identities as the act `seenBy` sees it
   * (Identity rules 23 and 24, F152): "not linked", "linked", "ended"
   * (`seenBy` holds a termination in its history) or "unknown".
   * @param {string} claim
   * @param {string} seen_by
   * @returns {string}
   */
  link(claim, seen_by) {
    let deferred4_0;
    let deferred4_1;
    try {
      const ptr0 = passStringToWasm0(claim, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(seen_by, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_link(this.__wbg_ptr, ptr0, len0, ptr1, len1);
      var ptr3 = ret[0];
      var len3 = ret[1];
      if (ret[3]) {
        ptr3 = 0;
        len3 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
  }
  /**
   * A verifier for the given Identity spec hash (`IDENTITY`; a test value
   * until the freeze). Given the Finance and Law spec hashes too, it can
   * tell which acts may carry acknowledgements (F110); without them, an
   * act of another specification carrying `acks` is unknown to it.
   * @param {string} identity_spec
   * @param {string | null} [finance_spec]
   * @param {string | null} [law_spec]
   */
  constructor(identity_spec, finance_spec, law_spec) {
    const ptr0 = passStringToWasm0(identity_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(finance_spec) ? 0 : passStringToWasm0(finance_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(law_spec) ? 0 : passStringToWasm0(law_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_new(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0];
    VerifierFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * The home quorum of a counting rotation (Finance rule 15, F180): the
   * receipts the home rule in effect before it requires, each passing
   * the receipt checks, per home operator, and how many operators are
   * needed. `kind` is "own" (it counts on its own signatures: anchor the
   * rotation itself), "homes" or "homeless"; null where it is not a
   * counting rotation. *The owner's client anchors these after a lock
   * change (Finance rule 15, F181).*
   * @param {string} identity
   * @param {string} rotation
   * @returns {any}
   */
  quorum(identity, rotation) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(rotation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_quorum(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Which act counts at each position of an identity chain.
   * @param {string} identity
   * @returns {any}
   */
  resolve(identity) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_resolve(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The standing of an act held: "valid", "disputed", "void", "pending",
   * "invalid", "unknown", or "scoped" (signed with a key a higher MIP's
   * act installs, a grant key: Law judges it, F128).
   * @param {string} act
   * @returns {string}
   */
  status(act) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_status(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
};
if (Symbol.dispose) Verifier.prototype[Symbol.dispose] = Verifier.prototype.free;
function actId(bytes) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.actId(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function cborDecode(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.cborDecode(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function cborEncode(v) {
  const ret = wasm.cborEncode(v);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function checkText(s) {
  const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.checkText(ptr0, len0);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function describeAct(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.describeAct(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function openMedia(locked, key, nonce) {
  const ptr0 = passArray8ToWasm0(locked, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(nonce, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ret = wasm.openMedia(ptr0, len0, ptr1, len1, ptr2, len2);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v4;
}
function openWithKey(act, key) {
  const ptr0 = passArray8ToWasm0(act, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.openWithKey(ptr0, len0, ptr1, len1);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function workHash(plaintext) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passArray8ToWasm0(plaintext, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.workHash(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_Error_30c8987f7c2ed4e2: function(arg0, arg1) {
      const ret = Error(getStringFromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_Number_14af1003b8dd5ead: function(arg0) {
      const ret = Number(arg0);
      return ret;
    },
    __wbg_String_8564e559799eccda: function(arg0, arg1) {
      const ret = String(arg1);
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_bigint_get_as_i64_a2383202b9353e4c: function(arg0, arg1) {
      const v = arg1;
      const ret = typeof v === "bigint" ? v : void 0;
      getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    },
    __wbg___wbindgen_boolean_get_5b446f51afd21013: function(arg0) {
      const v = arg0;
      const ret = typeof v === "boolean" ? v : void 0;
      return isLikeNone(ret) ? 16777215 : ret ? 1 : 0;
    },
    __wbg___wbindgen_debug_string_4687d8d8c2017d52: function(arg0, arg1) {
      const ret = debugString(arg1);
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_in_92f62ee1427d9e49: function(arg0, arg1) {
      const ret = arg0 in arg1;
      return ret;
    },
    __wbg___wbindgen_is_bigint_b123553bed3bb382: function(arg0) {
      const ret = typeof arg0 === "bigint";
      return ret;
    },
    __wbg___wbindgen_is_function_1f9d30630b8b1d3d: function(arg0) {
      const ret = typeof arg0 === "function";
      return ret;
    },
    __wbg___wbindgen_is_null_e343b7d08827ba72: function(arg0) {
      const ret = arg0 === null;
      return ret;
    },
    __wbg___wbindgen_is_object_3c45d4f2dde4e749: function(arg0) {
      const val = arg0;
      const ret = typeof val === "object" && val !== null;
      return ret;
    },
    __wbg___wbindgen_is_string_90b56bc79aad6f6c: function(arg0) {
      const ret = typeof arg0 === "string";
      return ret;
    },
    __wbg___wbindgen_is_undefined_8865fb403f8fe9d8: function(arg0) {
      const ret = arg0 === void 0;
      return ret;
    },
    __wbg___wbindgen_jsval_eq_02babf21faa37971: function(arg0, arg1) {
      const ret = arg0 === arg1;
      return ret;
    },
    __wbg___wbindgen_jsval_loose_eq_677f21e468d6b461: function(arg0, arg1) {
      const ret = arg0 == arg1;
      return ret;
    },
    __wbg___wbindgen_number_get_2e0e7dee9f701a71: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "number" ? obj : void 0;
      getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    },
    __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg_call_187d372bd5fdd4aa: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_call_6137034ef55c9d0f: function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
      }, arguments);
    },
    __wbg_crypto_38df2bab126b63dc: function(arg0) {
      const ret = arg0.crypto;
      return ret;
    },
    __wbg_done_b41a1d26cdb37fb6: function(arg0) {
      const ret = arg0.done;
      return ret;
    },
    __wbg_entries_3602f27ad32994b8: function(arg0) {
      const ret = arg0.entries();
      return ret;
    },
    __wbg_entries_fb6397112b1de25f: function(arg0) {
      const ret = Object.entries(arg0);
      return ret;
    },
    __wbg_from_296ca31f8d0f1c52: function(arg0) {
      const ret = Array.from(arg0);
      return ret;
    },
    __wbg_getRandomValues_c44a50d8cfdaebeb: function() {
      return handleError(function(arg0, arg1) {
        arg0.getRandomValues(arg1);
      }, arguments);
    },
    __wbg_get_658f6698067d9515: function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
      }, arguments);
    },
    __wbg_get_6c896e0571ddae51: function(arg0, arg1) {
      const ret = arg0[arg1 >>> 0];
      return ret;
    },
    __wbg_get_unchecked_288889d017702237: function(arg0, arg1) {
      const ret = arg0[arg1 >>> 0];
      return ret;
    },
    __wbg_get_with_ref_key_6412cf3094599694: function(arg0, arg1) {
      const ret = arg0[arg1];
      return ret;
    },
    __wbg_instanceof_ArrayBuffer_a99f175873e5d9b8: function(arg0) {
      let result;
      try {
        result = arg0 instanceof ArrayBuffer;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_Map_b2611749102d7ba3: function(arg0) {
      let result;
      try {
        result = arg0 instanceof Map;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_Uint8Array_828cef2aaacafc31: function(arg0) {
      let result;
      try {
        result = arg0 instanceof Uint8Array;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_isArray_e15a2ff68ffdbef2: function(arg0) {
      const ret = Array.isArray(arg0);
      return ret;
    },
    __wbg_isSafeInteger_717808ad6a54bd9e: function(arg0) {
      const ret = Number.isSafeInteger(arg0);
      return ret;
    },
    __wbg_iterator_e3c31c892080e444: function() {
      const ret = Symbol.iterator;
      return ret;
    },
    __wbg_length_7f3c00c40364105e: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_length_d4bdea10311bd9cf: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_msCrypto_bd5a034af96bcba6: function(arg0) {
      const ret = arg0.msCrypto;
      return ret;
    },
    __wbg_new_1dbf7428bba60a42: function(arg0) {
      const ret = new Uint8Array(arg0);
      return ret;
    },
    __wbg_new_28744009d011f847: function() {
      const ret = /* @__PURE__ */ new Map();
      return ret;
    },
    __wbg_new_617a8cdb8bb1130e: function() {
      const ret = new Object();
      return ret;
    },
    __wbg_new_ee2291f50781bf1d: function() {
      const ret = new Array();
      return ret;
    },
    __wbg_new_from_slice_9a868026ffa4208a: function(arg0, arg1) {
      const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_new_with_length_3da0ad195f6f63ba: function(arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return ret;
    },
    __wbg_next_33784799010f1bbe: function(arg0) {
      const ret = arg0.next;
      return ret;
    },
    __wbg_next_f4aac29c42af995c: function() {
      return handleError(function(arg0) {
        const ret = arg0.next();
        return ret;
      }, arguments);
    },
    __wbg_node_84ea875411254db1: function(arg0) {
      const ret = arg0.node;
      return ret;
    },
    __wbg_process_44c7a14e11e9f69e: function(arg0) {
      const ret = arg0.process;
      return ret;
    },
    __wbg_prototypesetcall_bc27214492979395: function(arg0, arg1, arg2) {
      Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    },
    __wbg_push_2baf45db356cf468: function(arg0, arg1) {
      const ret = arg0.push(arg1);
      return ret;
    },
    __wbg_randomFillSync_6c25eac9869eb53c: function() {
      return handleError(function(arg0, arg1) {
        arg0.randomFillSync(arg1);
      }, arguments);
    },
    __wbg_require_b4edbdcf3e2a1ef0: function() {
      return handleError(function() {
        const ret = module.require;
        return ret;
      }, arguments);
    },
    __wbg_set_6ae97e73113c4f0b: function(arg0, arg1, arg2) {
      const ret = arg0.set(arg1, arg2);
      return ret;
    },
    __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
      arg0[arg1] = arg2;
    },
    __wbg_set_bea140a88be9b277: function(arg0, arg1, arg2) {
      arg0[arg1 >>> 0] = arg2;
    },
    __wbg_static_accessor_GLOBAL_266715b9d96ba635: function() {
      const ret = typeof global === "undefined" ? null : global;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_GLOBAL_THIS_10fb7dc1ae063179: function() {
      const ret = typeof globalThis === "undefined" ? null : globalThis;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_SELF_0b583911f537483a: function() {
      const ret = typeof self === "undefined" ? null : self;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_WINDOW_d7f903d1508cbdc4: function() {
      const ret = typeof window === "undefined" ? null : window;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_subarray_002b94d5e13d1411: function(arg0, arg1, arg2) {
      const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
      return ret;
    },
    __wbg_value_f3c585ee8f5ba40c: function(arg0) {
      const ret = arg0.value;
      return ret;
    },
    __wbg_versions_276b2795b1c6a219: function(arg0) {
      const ret = arg0.versions;
      return ret;
    },
    __wbindgen_generic_0000000000000001: function(arg0) {
      const ret = arg0;
      return ret;
    },
    __wbindgen_generic_0000000000000002: function(arg0) {
      const ret = arg0;
      return ret;
    },
    __wbindgen_generic_0000000000000003: function(arg0, arg1) {
      const ret = getArrayU8FromWasm0(arg0, arg1);
      return ret;
    },
    __wbindgen_generic_0000000000000004: function(arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return ret;
    },
    __wbindgen_generic_0000000000000005: function(arg0) {
      const ret = BigInt.asUintN(64, arg0);
      return ret;
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    }
  };
  return {
    __proto__: null,
    "./mor_wasm_bg.js": import0
  };
}
var VerifierFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_verifier_free(ptr, 1));
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
function getArrayF64FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
function getArrayJsValueFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  const mem = getDataViewMemory0();
  const result = [];
  for (let i = ptr; i < ptr + 4 * len; i += 4) {
    result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
  }
  wasm.__externref_drop_slice(ptr, len);
  return result;
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
var cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
  if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
    cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
var cachedUint32ArrayMemory0 = null;
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passArrayJsValueToWasm0(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  for (let i = 0; i < array.length; i++) {
    const add = addToExternrefTable0(array[i]);
    getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
  }
  WASM_VECTOR_LEN = array.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view2 = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view2);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view2) {
    const buf = cachedTextEncoder.encode(arg);
    view2.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasmInstance;
var wasm;
function __wbg_finalize_init(instance, module2) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module2;
  cachedDataViewMemory0 = null;
  cachedFloat64ArrayMemory0 = null;
  cachedUint32ArrayMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_load(module2, imports) {
  if (typeof Response === "function" && module2 instanceof Response) {
    if (!module2.ok) {
      throw new Error(`failed to fetch Wasm: ${module2.status} ${module2.statusText} fetching '${module2.url}'`);
    }
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module2, imports);
      } catch (e) {
        const validResponse = expectedResponseType(module2.type);
        if (validResponse && module2.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module2.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module2, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module: module2 };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("mor_wasm_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module: module2 } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module2);
}

// src/shell/cannot.ts
var esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
var blocksWasm = () => typeof WebAssembly !== "object";
function refused(err) {
  if (blocksWasm()) return true;
  if (err instanceof WebAssembly.CompileError || err instanceof WebAssembly.LinkError) return true;
  return /wasm|webassembly/i.test(err instanceof Error ? `${err.name} ${err.message}` : String(err));
}
var ANOTHER_WAY = "or check the site without a browser, from a relay, with MOR's own tools (<code>mor-site verify</code>).";
function cannotCheck(err) {
  const bar2 = document.getElementById("mor-bar");
  if (!bar2) return;
  const why = err instanceof Error ? err.message : String(err);
  const words = refused(err) ? `<p>This browser does not run WebAssembly, which the checker needs: it runs MOR's core library, the code that checks who signed this site and that each page is exactly what they signed. Some privacy settings turn WebAssembly off, as do Tor Browser's Safer and Safest security levels.</p>
<p>To see the site: allow WebAssembly for it (in Tor Browser, the Standard security level), or open it in another browser; ${ANOTHER_WAY}</p>` : `<p>MOR's core library, the code that checks who signed this site and that each page is exactly what they signed, could not be started in this browser${why ? ` (${esc(why)})` : ""}.</p>
<p>Reload the page to try again; open it in another browser; ${ANOTHER_WAY}</p>`;
  bar2.className = "bad";
  bar2.innerHTML = `<div class="standing" id="mor-standing">${refused(err) ? "This page cannot be checked in this browser, so it is not shown." : "This page cannot be checked: the checker could not start. Not shown."}</div>
<details open id="mor-cannot"><summary>Why, and how to see it</summary>${words}<p>Nothing from the site is shown unchecked.</p></details>`;
  document.title = "Not checked";
  document.getElementById("mor-view")?.replaceChildren();
}
function stillLoading() {
  const standing = document.querySelector("#mor-bar.checking .standing");
  if (standing) standing.textContent = "Still loading the core library\u2026 On a slow connection, such as Tor, this can take a minute.";
}

// node_modules/@noble/hashes/_u64.js
var fromNumH = (n) => n / 2 ** 32 | 0;
var fromNumL = (n) => n >>> 0;
function setU64FromNum(view2, byteOffset, n, isLE) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view2.setUint32(byteOffset, isLE ? l : h, isLE);
  view2.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}

// node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle = (title2) => title2 ? `"${title2}" ` : "";
function anumber(n, title2 = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title2) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title2) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title2 = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message2 = atitle(title2) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message2);
  throw new RangeError(message2);
}
var aobject = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
};
var aopts = (value, label) => {
  aobject(value, label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new TypeError(`"${label}" expected plain object`);
  if (Object.hasOwn(value, "__proto__"))
    throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function checkOpts(defaults, opts, title2 = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title2);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts({}, info, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
var oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  canXOF = false;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view: view2, buffer, blockLen } = this;
    const len = data.length;
    let processed = false;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        processed = true;
        continue;
      }
      buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view2, 0);
        this.pos = 0;
        processed = true;
      }
    }
    this.length += data.length;
    if (processed)
      this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view: view2, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view2, 0);
      buffer.fill(0);
    }
    setU64FromNum(view2, blockLen - 8, this.length * 8, isLE);
    this.process(view2, 0);
    this.roundClean();
    const oview = out === buffer ? view2 : createView(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state2 = this.get();
    if (len % 4 || outLen > state2.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state2[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneIntoMeta(to) {
    const { buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (pos)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  // Numeric initializers matter: starting the fields as `undefined` changes
  // V8's field representation and makes sha256 3x slower (measured).
  A = 0;
  B = 0;
  C = 0;
  D = 0;
  E = 0;
  F = 0;
  G = 0;
  H = 0;
  constructor(outputLen, IV) {
    super(64, outputLen, 8, false);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  _cloneInto(to) {
    (to ||= new this.constructor()).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view2, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view2.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  constructor() {
    super(32, SHA256_IV);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);

// ../reader/src/web/common.ts
var HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
var hex = (b) => {
  let s = "";
  for (const x of b) s += HEX[x];
  return s;
};
var unhex = (s) => {
  if (s.length % 2 || /[^0-9a-fA-F]/.test(s)) throw new Error("not hex");
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(2 * i, 2 * i + 2), 16);
  return out;
};
var base64 = (b) => {
  let s = "";
  for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode(...b.subarray(i, i + 32768));
  return btoa(s);
};
var sha2562 = (data) => hex(sha256(typeof data === "string" ? new TextEncoder().encode(data) : data));
var SPECS = {
  identity: sha2562("IDENTITY, test value until the freeze"),
  envelope: sha2562("ENVELOPE, test value until the freeze"),
  text: sha2562("TEXT, test value until the freeze")
};
var MIPS = {
  ...SPECS,
  finance: sha2562("FINANCE, test value until the freeze"),
  law: sha2562("LAW, test value until the freeze"),
  production: sha2562("PRODUCTION, test value until the freeze")
};
var ACK_SPECS = [MIPS.identity, MIPS.finance, MIPS.law];
var IDENTITY_TYPES = { genesis: 0, rotation: 1, receipt: 2, routes: 3, witness: 15, chainSignature: 16 };
var ENVELOPE_TYPES = { publication: 0, keyDelivery: 1, encryptionKey: 4 };

// src/web/core.ts
var slow = setTimeout(stillLoading, 2e4);
try {
  if (blocksWasm()) throw new Error("WebAssembly is turned off in this browser");
  await __wbg_init({ module_or_path: new URL("/_mor/mor_wasm_bg.wasm", location.origin) });
} catch (err) {
  cannotCheck(err);
  throw err;
} finally {
  clearTimeout(slow);
}

// ../genesis/src/transport.ts
var RelayError = class extends Error {
  constructor(code, reason, acts = [], status = 0) {
    super(`relay error ${code}: ${reason}`);
    this.code = code;
    this.reason = reason;
    this.acts = acts;
    this.status = status;
  }
};
var CODE = {
  malformed: 0,
  invalid: 1,
  notServed: 2,
  missingPredecessor: 3,
  conflict: 4,
  refused: 5,
  tooLarge: 6,
  notAccepted: 7,
  notHeld: 8,
  notSupported: 9,
  slowDown: 10
};
var bytesList = (v) => Array.isArray(v) ? v : [];
var sealedId = (bytes) => {
  const t = unhex(sha2562("MOR/transport/sealed"));
  const all = new Uint8Array(64 + bytes.length);
  all.set(t, 0);
  all.set(t, 32);
  all.set(bytes, 64);
  return sha2562(all);
};
var Relay = class {
  constructor(base, via = base) {
    this.base = base;
    this.via = via;
  }
  async call(path, init) {
    const r = await fetch(this.via.replace(/\/$/, "") + path, init);
    const body = new Uint8Array(await r.arrayBuffer());
    if (!r.ok) {
      let code = -1;
      let reason = `HTTP ${r.status}`;
      let acts = [];
      try {
        const e = cborDecode(body);
        code = e.get(0);
        reason = e.get(1) ?? reason;
        acts = bytesList(e.get(2));
      } catch {
      }
      throw new RelayError(code, reason, acts, r.status);
    }
    return body;
  }
  post(path, body, type = "application/cbor") {
    return this.call(path, { method: "POST", body, headers: { "content-type": type } });
  }
  async info() {
    return cborDecode(await this.call("/info"));
  }
  /** `POST /acts`. The act id in the answer is checked against the act sent. */
  async putAct(act) {
    const m = cborDecode(await this.post("/acts", act));
    const id = hex(m.get(0));
    if (id !== actId(act)) throw new RelayError(-1, "the relay answered for another act");
    return {
      id,
      arrival: m.get(1),
      receipt: m.get(2),
      objection: m.get(3)
    };
  }
  /** `POST /sealed`, with pickup tags for a container sent to a bare key. */
  async putSealed(sealed, pickup = []) {
    const req = /* @__PURE__ */ new Map([[0, sealed]]);
    if (pickup.length) req.set(1, pickup.map(unhex));
    const m = cborDecode(await this.post("/sealed", cborEncode(req)));
    const id = hex(m.get(0));
    if (id !== sealedId(sealed)) throw new RelayError(-1, "the relay answered for another container");
    return { id, arrival: m.get(1) };
  }
  /** `GET /acts/{id}`, checked: `null` when the relay does not hold it (which proves nothing). */
  async getAct(id) {
    try {
      const a = await this.call(`/acts/${id}`);
      return actId(a) === id ? a : null;
    } catch (e) {
      if (e instanceof RelayError && e.code === CODE.notHeld) return null;
      throw e;
    }
  }
  /** `POST /media`: the relay's answer is checked against the bytes sent. */
  async putMedia(locked) {
    const m = cborDecode(await this.post("/media", locked, "application/octet-stream"));
    const lockedHash = hex(m[0]);
    if (lockedHash !== sha2562(locked) || m[1] !== locked.length) {
      throw new RelayError(-1, "the relay answered for other media");
    }
    return { lockedHash, size: m[1] };
  }
  /** `GET /media/{locked hash}`, checked: `null` when not held or not matching. */
  async getMedia(lockedHash) {
    try {
      const b = await this.call(`/media/${lockedHash}`);
      return sha2562(b) === lockedHash ? b : null;
    } catch (e) {
      if (e instanceof RelayError && e.code === CODE.notHeld) return null;
      throw e;
    }
  }
  async feed(q) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) {
      if (v === void 0) continue;
      p.set(k, k === "unaddressed" ? v ? "1" : "0" : String(v));
    }
    const m = cborDecode(await this.call(`/feed?${p}`));
    const items = m.get(0).map(([arrival, kind, item]) => ({
      arrival,
      kind: kind === 0 ? "act" : "sealed",
      item
    }));
    return { items, next: m.get(1) };
  }
  /** `GET /identity/{id}`: everything the home holds about an identity. */
  async identity(id) {
    const m = cborDecode(await this.call(`/identity/${id}`));
    const got = hex(m.get(0));
    if (got !== id) throw new RelayError(-1, "an identity record for another identity");
    return {
      identity: got,
      chain: bytesList(m.get(1)),
      receipts: bytesList(m.get(2)),
      routes: bytesList(m.get(3)),
      encryptionKeys: bytesList(m.get(4)),
      names: bytesList(m.get(5)),
      links: bytesList(m.get(6)),
      evidence: bytesList(m.get(7)),
      otherReceipts: bytesList(m.get(8))
    };
  }
};
var relayAt = (hint, via = {}) => new Relay(hint, via[hint] ?? hint);

// ../genesis/src/lookup.ts
async function lookUp(identity, hints, via = {}, into) {
  const v = into ?? new Verifier(SPECS.identity, MIPS.finance, MIPS.law);
  const tried = /* @__PURE__ */ new Set();
  const unreachable = [];
  const operatorActs = /* @__PURE__ */ new Map();
  const add = (acts) => {
    for (const a of acts) {
      try {
        v.add(a);
      } catch {
      }
    }
  };
  let genesis = null;
  for (const h of hints) {
    try {
      genesis = await relayAt(h, via).getAct(identity);
    } catch {
      unreachable.push(h);
    }
    if (genesis) break;
  }
  if (!genesis) throw new Error(`the genesis of ${identity} was not found at ${hints.join(", ")}`);
  add([genesis]);
  const homesNamed = () => {
    const out = [];
    for (const id of v.held()) {
      let d;
      try {
        d = describeAct(heldBytes.get(id));
      } catch {
        continue;
      }
      if (d.spec !== SPECS.identity || !d.payload) continue;
      if (d.type !== IDENTITY_TYPES.genesis && d.type !== IDENTITY_TYPES.rotation) continue;
      if ((d.signer ?? d.id) !== identity) continue;
      const p = cborDecode(d.payload);
      const homes = p.get(d.type === 0 ? 2 : 6);
      for (const [op, hint] of homes ?? []) out.push({ operator: op ? hex(op) : null, hint });
    }
    return out;
  };
  const heldBytes = /* @__PURE__ */ new Map([[actId(genesis), genesis]]);
  const keep = (acts) => {
    for (const a of acts) {
      try {
        heldBytes.set(actId(a), a);
      } catch {
      }
    }
    add(acts);
  };
  for (let round = 0; round < 4; round++) {
    const fresh = homesNamed().filter((h) => !tried.has(h.hint));
    if (!fresh.length) break;
    for (const h of fresh) {
      tried.add(h.hint);
      const r2 = relayAt(h.hint, via);
      try {
        const rec = await r2.identity(identity);
        keep([...rec.chain, ...rec.receipts, ...rec.routes, ...rec.encryptionKeys, ...rec.evidence, ...rec.otherReceipts]);
        for (const a of rec.links) {
          try {
            const d = describeAct(a);
            if (!d.public && d.signer === identity) v.foundAtHome(d.id, h.operator ?? identity);
          } catch {
          }
        }
      } catch {
        unreachable.push(h.hint);
        continue;
      }
    }
  }
  const operators = new Set(homesNamed().map((h) => h.operator ?? identity));
  operators.delete(identity);
  const answered = [...tried].filter((h) => !unreachable.includes(h));
  for (const op of operators) {
    const own = homesNamed().filter((h) => h.operator === op).map((h) => h.hint);
    for (const hint of [...own.filter((h) => answered.includes(h)), ...answered.filter((h) => !own.includes(h))]) {
      const r2 = relayAt(hint, via);
      try {
        const g = await r2.getAct(op);
        if (!g) continue;
        keep([g]);
        operatorActs.set(op, [g]);
        const page = await r2.feed({ signer: op });
        const chain = page.items.filter((i) => i.kind === "act").map((i) => i.item).filter((a) => {
          const d = describeAct(a);
          return d.spec === SPECS.identity && d.type === IDENTITY_TYPES.rotation;
        });
        keep(chain);
        operatorActs.get(op).push(...chain);
        break;
      } catch {
      }
    }
  }
  const resolution = v.resolve(identity);
  const r = v.latest(identity, SPECS.identity, IDENTITY_TYPES.routes);
  const routes = [];
  if (r.payload) {
    const p = cborDecode(r.payload);
    for (const x of p.get(2)) {
      routes.push({
        scope: x[0] ? hex(x[0]) : null,
        hints: x[1],
        kind: x[2] ?? 0
      });
    }
  }
  const e = v.latest(identity, SPECS.envelope, ENVELOPE_TYPES.encryptionKey);
  let encryptionKey = null;
  if (e.payload) {
    const p = cborDecode(e.payload);
    const [scheme, key] = p.get(2);
    if (scheme === 4) encryptionKey = key;
  }
  const receipts = [];
  for (const [id, a] of heldBytes) {
    const d = describeAct(a);
    if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.receipt || !d.payload) continue;
    const p = cborDecode(d.payload);
    if (hex(p.get(0)) === identity && v.status(id) === "valid") receipts.push(a);
  }
  return {
    resolution,
    verifier: v,
    receipts,
    operatorChains: [...operatorActs.values()].flat(),
    unreachable,
    routes: { act: r.act ?? null, contested: r.contested, routes },
    encryptionKeyAct: e.act ?? null,
    encryptionKey,
    inbox(spec) {
      const inboxes = routes.filter((x) => x.kind === 1);
      const hit = inboxes.find((x) => x.scope === spec) ?? inboxes.find((x) => x.scope === null);
      return hit ? hit.hints : null;
    }
  };
}

// ../../modules/jpeg/src/jpeg.ts
var NotJpeg = class extends Error {
};
var CARRIED_WORDS = {
  exif: "camera data (Exif)",
  location: "the place the picture was taken (GPS)",
  "exif-thumbnail": "a small preview picture (Exif)",
  xmp: "descriptive data (XMP)",
  iptc: "captions and credits (IPTC)",
  comment: "a comment",
  "jfif-thumbnail": "a small preview picture (JFIF)",
  "jfxx-thumbnail": "a small preview picture (JFXX)",
  "multi-picture": "further pictures (multi-picture format)",
  "bytes-after-end": "bytes after the end of the picture",
  "other-application-data": "other application data"
};
var SOI = 216;
var EOI = 217;
var SOS = 218;
var DNL = 220;
var APP0 = 224;
var APP1 = 225;
var APP2 = 226;
var APP13 = 237;
var APP14 = 238;
var COM = 254;
function isFrame(m) {
  return m >= 192 && m <= 207 && m !== 196 && m !== 200 && m !== 204;
}
var PROCESS = {
  192: "baseline",
  193: "extended sequential",
  194: "progressive",
  195: "lossless",
  197: "differential sequential",
  198: "differential progressive",
  199: "differential lossless",
  201: "extended sequential, arithmetic coding",
  202: "progressive, arithmetic coding",
  203: "lossless, arithmetic coding",
  205: "differential sequential, arithmetic coding",
  206: "differential progressive, arithmetic coding",
  207: "differential lossless, arithmetic coding"
};
var ascii = (b, from, s) => {
  if (b.length < from + s.length) return false;
  for (let i = 0; i < s.length; i++) if (b[from + i] !== s.charCodeAt(i)) return false;
  return true;
};
var u16 = (b, i) => b[i] << 8 | b[i + 1];
function segments(b) {
  if (b.length < 4 || b[0] !== 255 || b[1] !== SOI) throw new NotJpeg("it does not begin with a JPEG start marker");
  const out = [];
  let i = 2;
  let frameSeen = false;
  let hierarchical = false;
  for (; ; ) {
    if (i >= b.length) throw new NotJpeg("it ends before its end marker");
    if (b[i] !== 255) throw new NotJpeg(`a byte that is not a marker at ${i}`);
    while (i < b.length && b[i] === 255) i++;
    if (i >= b.length) throw new NotJpeg("it ends before its end marker");
    const m = b[i];
    const start = i - 1;
    i++;
    if (m === EOI) {
      if (!frameSeen) throw new NotJpeg("it has no frame header");
      out.push({ marker: m, start, end: i, body: new Uint8Array(0) });
      return { segments: out, end: i };
    }
    if (m === SOI) throw new NotJpeg("a second start marker before the end");
    if (m === 0 || m === 1 || m >= 208 && m <= 215) throw new NotJpeg(`a stray marker FF${hex2(m)} at ${start}`);
    if (i + 2 > b.length) throw new NotJpeg("it ends inside a segment");
    const len = u16(b, i);
    if (len < 2 || i + len > b.length) throw new NotJpeg(`a segment runs past the end of the file at ${start}`);
    const body = b.subarray(i + 2, i + len);
    i += len;
    if (m === 222) hierarchical = true;
    if (isFrame(m)) {
      if (frameSeen && !hierarchical) throw new NotJpeg("a second frame header");
      frameSeen = true;
    }
    if (m === SOS) {
      if (!frameSeen) throw new NotJpeg("a scan before the frame header");
      for (; ; ) {
        if (i + 1 >= b.length) throw new NotJpeg("it ends inside the compressed picture");
        if (b[i] === 255) {
          const n = b[i + 1];
          if (n === 0 || n >= 208 && n <= 215) {
            i += 2;
            continue;
          }
          if (n === 255) {
            i++;
            continue;
          }
          break;
        }
        i++;
      }
    }
    out.push({ marker: m, start, end: i, body });
  }
}
var hex2 = (n) => n.toString(16).toUpperCase().padStart(2, "0");
function readExif(body) {
  const none = { orientation: null, location: false, thumbnail: false };
  if (!ascii(body, 0, "Exif\0\0")) return none;
  const t = body.subarray(6);
  if (t.length < 8) return none;
  const le = t[0] === 73 && t[1] === 73;
  const be = t[0] === 77 && t[1] === 77;
  if (!le && !be) return none;
  const r16 = (o) => o + 2 > t.length ? -1 : le ? t[o] | t[o + 1] << 8 : t[o] << 8 | t[o + 1];
  const r32 = (o) => o + 4 > t.length ? -1 : le ? (t[o] | t[o + 1] << 8 | t[o + 2] << 16 | t[o + 3] << 24) >>> 0 : (t[o] << 24 | t[o + 1] << 16 | t[o + 2] << 8 | t[o + 3]) >>> 0;
  if (r16(2) !== 42) return none;
  const ifd0 = r32(4);
  const entries = (o) => {
    const n = r16(o);
    if (n < 0 || o + 2 + 12 * n + 4 > t.length) return null;
    const list = [];
    for (let k = 0; k < n; k++) {
      const at = o + 2 + 12 * k;
      list.push({ tag: r16(at), type: r16(at + 2), count: r32(at + 4), at: at + 8 });
    }
    return { list, next: r32(o + 2 + 12 * n) };
  };
  const first = entries(ifd0);
  if (!first) return none;
  let orientation = null;
  let location2 = false;
  for (const e of first.list) {
    if (e.tag === 274 && e.type === 3 && e.count === 1) orientation = r16(e.at);
    if (e.tag === 34853) location2 = true;
  }
  let thumbnail = false;
  if (first.next > 0 && first.next < t.length) {
    const second = entries(first.next);
    if (second) thumbnail = second.list.some((e) => e.tag === 513 || e.tag === 273);
  }
  return { orientation, location: location2, thumbnail };
}
function read(b) {
  const { segments: segs, end } = segments(b);
  const frame = segs.find((s) => isFrame(s.marker));
  if (frame.body.length < 6) throw new NotJpeg("a frame header too short");
  const precision = frame.body[0];
  let height = u16(frame.body, 1);
  const width = u16(frame.body, 3);
  const components = frame.body[5];
  if (frame.body.length !== 6 + 3 * components) throw new NotJpeg("a frame header of the wrong length");
  if (width === 0) throw new NotJpeg("a picture zero pixels wide");
  if (components === 0) throw new NotJpeg("a picture with no colour component");
  if (height === 0) {
    const dnl = segs.find((s) => s.marker === DNL);
    if (!dnl || dnl.body.length !== 2 || u16(dnl.body, 0) === 0) throw new NotJpeg("a picture of no height");
    height = u16(dnl.body, 0);
  }
  const carries = /* @__PURE__ */ new Set();
  let orientation = null;
  let exifSeen = false;
  let colourProfile = false;
  let adobe = false;
  let jfifSeen = false;
  for (const s of segs) {
    const m = s.marker;
    if (m === APP0) {
      if (isJfif(s.body) && !jfifSeen) {
        jfifSeen = true;
        if (s.body[12] * s.body[13] > 0) carries.add("jfif-thumbnail");
      } else if (ascii(s.body, 0, "JFIF\0")) carries.add("other-application-data");
      else if (ascii(s.body, 0, "JFXX\0")) carries.add("jfxx-thumbnail");
      else carries.add("other-application-data");
    } else if (m === APP1) {
      if (ascii(s.body, 0, "Exif\0\0")) {
        const e = readExif(s.body);
        if (!exifSeen) orientation = e.orientation;
        exifSeen = true;
        if (e.location) carries.add("location");
        if (e.thumbnail) carries.add("exif-thumbnail");
        if (!isOnlyOrientation(s.body)) carries.add("exif");
      } else if (ascii(s.body, 0, "http://ns.adobe.com/xap/1.0/") || ascii(s.body, 0, "http://ns.adobe.com/xmp/")) {
        carries.add("xmp");
      } else carries.add("other-application-data");
    } else if (m === APP2) {
      if (ascii(s.body, 0, "ICC_PROFILE\0")) colourProfile = true;
      else if (ascii(s.body, 0, "MPF\0")) carries.add("multi-picture");
      else carries.add("other-application-data");
    } else if (m === APP13) {
      carries.add("iptc");
    } else if (m === APP14) {
      if (ascii(s.body, 0, "Adobe")) adobe = true;
      else carries.add("other-application-data");
    } else if (m > APP0 && m <= 239) {
      carries.add("other-application-data");
    } else if (m === COM) {
      carries.add("comment");
    }
  }
  if (end < b.length) carries.add("bytes-after-end");
  const o = orientation !== null && orientation >= 1 && orientation <= 8 ? orientation : 1;
  const turned = o >= 5;
  return {
    frame: frame.marker,
    process: PROCESS[frame.marker] ?? "unknown",
    precision,
    width,
    height,
    components,
    orientation: o,
    shownWidth: turned ? height : width,
    shownHeight: turned ? width : height,
    colourProfile,
    adobe,
    end,
    carries: [...carries],
    segments: segs
  };
}
function orientationExif(orientation) {
  if (!Number.isInteger(orientation) || orientation < 2 || orientation > 8) throw new Error("an orientation from 2 to 8");
  return Uint8Array.from([
    69,
    120,
    105,
    102,
    0,
    0,
    77,
    77,
    0,
    42,
    0,
    0,
    0,
    8,
    0,
    1,
    1,
    18,
    0,
    3,
    0,
    0,
    0,
    1,
    0,
    orientation,
    0,
    0,
    0,
    0,
    0,
    0
  ]);
}
function isJfif(body) {
  return ascii(body, 0, "JFIF\0") && body.length >= 14;
}
function isOnlyOrientation(body) {
  const e = readExif(body);
  if (e.orientation === null || e.orientation < 2 || e.orientation > 8) return false;
  const want = orientationExif(e.orientation);
  return body.length === want.length && body.every((x, i) => x === want[i]);
}

// ../longform/src/specs.ts
var test = (s) => sha2562(s);
var LONGFORM_SPECS = {
  /** The Text MIP (`TEXT`). */
  text: SPECS.text,
  /** The long-form text format cMIP (cmips/cmip-long-form-draft-1.md). */
  longform: test("long-form text format cMIP, draft 1, test value until publication")
};

// ../barebone/src/specs.ts
var test2 = (s) => sha2562(s);
var POST_SPECS = {
  /** The Text MIP (`TEXT`). */
  text: LONGFORM_SPECS.text,
  /** The Envelope MIP (`ENVELOPE`). */
  envelope: SPECS.envelope,
  /** The long-form text format cMIP: a post naming it is rendered with it. */
  longform: LONGFORM_SPECS.longform,
  /** The JPEG Module (modules/module-jpeg-draft-1.md). */
  jpeg: test2("JPEG Module, draft 1, test value until publication")
};
var TEXT_ACT = 0;
var PUBLICATION = 0;
var WITHDRAWAL = 3;

// ../barebone/src/post.ts
async function fetchAct(id, hints, via) {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
    }
  }
  return null;
}
function describeChecked(act, id) {
  const d = describeAct(act);
  if (d.id !== id) throw new Error(`the relay answered with ${d.id}, not ${id}`);
  if (d.public && !d.payload) {
    openWithKey(act, new Uint8Array(32));
    throw new Error("the act does not open");
  }
  return d;
}
var Judge = class {
  constructor(hints, via) {
    this.hints = hints;
    this.via = via;
    this.v = new Verifier(SPECS.identity, MIPS.finance, MIPS.law);
  }
  v;
  looked = /* @__PURE__ */ new Set();
  async standing(act, id, signer) {
    if (!this.looked.has(signer)) {
      await lookUp(signer, this.hints, this.via, this.v);
      this.looked.add(signer);
    }
    this.v.add(act);
    return this.v.status(id);
  }
};
async function readPost(id, hints, via = {}) {
  const act = await fetchAct(id, hints, via);
  if (!act) throw new Error(`the act ${id} was not found at ${hints.join(", ")}`);
  const d = describeChecked(act, id);
  if (!d.public) throw new Error("the post is not public");
  if (d.spec !== POST_SPECS.text || d.type !== TEXT_ACT) throw new Error("the act is not a text act");
  if (!d.signer) throw new Error("the act has no signer");
  const p = cborDecode(d.payload);
  const text = p.get(0);
  if (typeof text !== "string") throw new Error("the text act has no text");
  const f = p.get(1);
  const judge = new Judge(hints, via);
  const standing = await judge.standing(act, id, d.signer);
  const refs = [];
  for (const r of d.refs ?? []) refs.push(await readRef(r, hints, via, judge));
  return { id, signer: d.signer, standing, text, format: f instanceof Uint8Array ? hex(f) : null, refs };
}
async function readRef(id, hints, via, judge) {
  const act = await fetchAct(id, hints, via);
  if (!act) return { kind: "act", id, what: "not found at the relays asked" };
  let d;
  try {
    d = describeChecked(act, id);
  } catch (e) {
    return { kind: "act", id, what: `not a valid act: ${e instanceof Error ? e.message : e}` };
  }
  if (!d.public) return { kind: "act", id, what: "a private act" };
  if (d.spec === POST_SPECS.text && d.type === TEXT_ACT) return { kind: "act", id, what: "a text act" };
  if (d.spec !== POST_SPECS.envelope || d.type !== PUBLICATION) return { kind: "act", id, what: "an act of a specification this client does not implement" };
  return readPicture(act, d, hints, via, judge);
}
async function readPicture(act, d, hints, via, judge) {
  const out = {
    kind: "picture",
    publication: d.id,
    signer: d.signer ?? "",
    standing: "unknown",
    problem: null,
    withdrawn: null,
    bytes: null,
    picture: null
  };
  const no = (why) => (out.problem = why, out);
  if (!d.signer) return no("the publication has no signer");
  out.standing = await judge.standing(act, d.id, d.signer);
  if (out.standing !== "valid") return no(`the publication is ${out.standing}, not valid, for its signer's identity chain`);
  const m = cborDecode(d.payload);
  const spec = m.get(0);
  if (!(spec instanceof Uint8Array) || hex(spec) !== POST_SPECS.jpeg) return no("media of a type this client does not implement");
  const work = m.get(1);
  const lockedHash = m.get(2);
  const size = m.get(3);
  const nonce = m.get(4);
  const key = m.get(5);
  if (!(key instanceof Uint8Array)) return no("the picture is locked: its key is not public");
  if (!(work instanceof Uint8Array) || !(lockedHash instanceof Uint8Array) || typeof size !== "number" || !(nonce instanceof Uint8Array)) {
    return no("the publication does not describe its media");
  }
  out.withdrawn = await findWithdrawal(d.id, d.signer, m.get(8), hints, via, judge);
  if (out.withdrawn) return no("withdrawn by its signer");
  const named = Array.isArray(m.get(6)) ? m.get(6).filter((x) => typeof x === "string") : [];
  let locked = null;
  for (const h of [...hints, ...named.filter((n) => !hints.includes(n))]) {
    try {
      locked = await relayAt(h, via).getMedia(hex(lockedHash));
      if (locked) break;
    } catch {
    }
  }
  if (!locked) return no("its bytes were not found");
  let plain;
  try {
    plain = openMedia(locked, key, nonce);
  } catch {
    return no("its key does not open its bytes");
  }
  if (workHash(plain) !== hex(work) || plain.length !== size) return no("its bytes do not match the work hash and size it was published with");
  try {
    out.picture = read(plain);
  } catch (e) {
    if (e instanceof NotJpeg) return no(`not a JPEG this client reads: ${e.message}`);
    throw e;
  }
  out.bytes = plain;
  return out;
}
async function findWithdrawal(publication, signer, forId, hints, via, judge) {
  const who = [signer];
  if (forId instanceof Uint8Array) who.push(hex(forId));
  for (const h of hints) {
    for (const s of who) {
      let after;
      for (; ; ) {
        let page;
        try {
          page = await relayAt(h, via).feed({ signer: s, after });
        } catch {
          break;
        }
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          let d;
          try {
            d = describeAct(it.item);
          } catch {
            continue;
          }
          if (d.spec !== POST_SPECS.envelope || d.type !== WITHDRAWAL || !d.signer) continue;
          if (!(d.objects ?? []).some(([chain]) => chain === publication)) continue;
          if (await judge.standing(it.item, d.id, d.signer) === "valid") return d.id;
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    }
  }
  return null;
}

// ../longform/src/format.ts
var MAX_DEPTH = 16;
var DECLARED = {
  heading: "# ",
  rule: "-*",
  "fence-open": "`",
  "fence-close": "`",
  quote: "> ",
  item: " ",
  indent: " ",
  escape: "\\",
  "code-open": "`",
  "code-close": "`",
  "link-open": "<",
  "link-close": ">",
  "em-open": "*",
  "em-close": "*"
};
var ENDS_BLOCK = "\n";
var ESCAPABLE = /* @__PURE__ */ new Set(["\\", "`", "*", "_", "#", "-", "+", ".", ">", "<", "[", "]", "(", ")", "!", "|", "~"]);
var SPACES = /* @__PURE__ */ new Set([
  32,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8239,
  8287,
  12288
]);
var isSpace = (s, i) => SPACES.has(s.charCodeAt(i));
function linkCloseShown(s, i) {
  return isDigit(charBefore(s, i)) || isDigit(charAt(s, i + 1));
}
var AUTOLINK = /^<((?:https?|mailto):[^ <>]+)>/;
function parse(source) {
  const lines = [];
  let start = 0;
  for (; ; ) {
    const lf = source.indexOf("\n", start);
    if (lf < 0) {
      lines.push({ from: start, to: source.length });
      break;
    }
    lines.push({ from: start, to: lf });
    start = lf + 1;
  }
  const p = new Parser(source);
  const blocks = p.blocks(lines, 0);
  return { source, blocks, marks: p.marks.sort((a, b) => a.span.from - b.span.from) };
}
var FENCE = /^(`{3,})([^`]*)$/;
var HEADING = /^(#{1,6}) (.+)$/;
var RULE = /^(?:-{3,}|\*{3,})$/;
var BULLET = /^([-*+]) /;
var ORDERED = /^([0-9]{1,9}\.) /;
var Parser = class {
  constructor(s) {
    this.s = s;
  }
  marks = [];
  mark(rule, from, to) {
    if (to > from) this.marks.push({ rule, span: { from, to } });
  }
  text(l) {
    return this.s.slice(l.from, l.to);
  }
  /** The item marker a line starts with, if any, and its width including the space. */
  marker(l) {
    const x = this.text(l);
    let m = BULLET.exec(x);
    if (m) return { kind: m[1], width: 2, marker: { from: l.from, to: l.from + 1 } };
    m = ORDERED.exec(x);
    if (m) return { kind: ".", width: m[1].length + 1, marker: { from: l.from, to: l.from + m[1].length } };
    return null;
  }
  /** Does this line open a block other than a paragraph (so it ends one)? */
  starts(l, depth) {
    const x = this.text(l);
    if (FENCE.test(x) || HEADING.test(x) || RULE.test(x)) return true;
    if (depth < MAX_DEPTH && (x.startsWith(">") || this.marker(l))) return true;
    return false;
  }
  blocks(lines, depth) {
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      const x = this.text(l);
      if (x === "") {
        i++;
        continue;
      }
      let m = FENCE.exec(x);
      if (m) {
        const n = m[1].length;
        const label = m[2] === "" ? null : { from: l.from + n, to: l.to };
        this.mark("fence-open", l.from, l.from + n);
        const body = [];
        i++;
        while (i < lines.length) {
          const y = this.text(lines[i]);
          if (/^`+$/.test(y) && y.length >= n) {
            this.mark("fence-close", lines[i].from, lines[i].to);
            i++;
            break;
          }
          body.push(lines[i]);
          i++;
        }
        out.push({ t: "code", label, lines: body });
        continue;
      }
      m = HEADING.exec(x);
      if (m) {
        const level = m[1].length;
        this.mark("heading", l.from, l.from + level + 1);
        out.push({ t: "heading", level, children: this.inline({ from: l.from + level + 1, to: l.to }) });
        i++;
        continue;
      }
      if (RULE.test(x)) {
        this.mark("rule", l.from, l.to);
        out.push({ t: "rule" });
        i++;
        continue;
      }
      if (depth < MAX_DEPTH && x.startsWith(">")) {
        const inner = [];
        while (i < lines.length && this.s[lines[i].from] === ">" && lines[i].from < lines[i].to) {
          const q = lines[i];
          const skip = this.s[q.from + 1] === " " && q.from + 1 < q.to ? 2 : 1;
          this.mark("quote", q.from, q.from + skip);
          inner.push({ from: q.from + skip, to: q.to });
          i++;
        }
        out.push({ t: "quote", children: this.blocks(inner, depth + 1) });
        continue;
      }
      const first = depth < MAX_DEPTH ? this.marker(l) : null;
      if (first) {
        const items = [];
        while (i < lines.length) {
          const mk = this.marker(lines[i]);
          if (!mk || mk.kind !== first.kind) break;
          const w = mk.width;
          this.mark("item", lines[i].from + w - 1, lines[i].from + w);
          const body = [{ from: lines[i].from + w, to: lines[i].to }];
          i++;
          const indent = " ".repeat(w);
          while (i < lines.length) {
            const y = this.text(lines[i]);
            if (y.startsWith(indent)) {
              this.mark("indent", lines[i].from, lines[i].from + w);
              body.push({ from: lines[i].from + w, to: lines[i].to });
              i++;
              continue;
            }
            if (y === "") {
              let j2 = i;
              while (j2 < lines.length && this.text(lines[j2]) === "") j2++;
              if (j2 < lines.length && this.text(lines[j2]).startsWith(indent)) {
                for (; i < j2; i++) body.push({ from: lines[i].from, to: lines[i].to });
                continue;
              }
            }
            break;
          }
          items.push({ marker: mk.marker, children: this.blocks(body, depth + 1) });
          let j = i;
          while (j < lines.length && this.text(lines[j]) === "") j++;
          const next = j < lines.length ? this.marker(lines[j]) : null;
          if (!next || next.kind !== first.kind) break;
          i = j;
        }
        out.push({ t: "list", ordered: first.kind === ".", items });
        continue;
      }
      const children = [...this.inline(l)];
      i++;
      while (i < lines.length && this.text(lines[i]) !== "" && !this.starts(lines[i], depth)) {
        children.push({ t: "break", at: lines[i - 1].to }, ...this.inline(lines[i]));
        i++;
      }
      out.push({ t: "paragraph", children });
    }
    return out;
  }
  // -------------------------------------------------------------- inlines
  /** The inline content of one line (rule 9). */
  inline(l) {
    const s = this.s;
    const toks = [];
    let run = -1;
    const flush = (end) => {
      if (run >= 0 && end > run) toks.push({ k: "node", node: { t: "text", span: { from: run, to: end } } });
      run = -1;
    };
    const lit = (at) => {
      if (run < 0) run = at;
    };
    let p = l.from;
    while (p < l.to) {
      const c = s[p];
      if (c === "\\" && p + 1 < l.to && ESCAPABLE.has(s[p + 1])) {
        flush(p);
        this.mark("escape", p, p + 1);
        run = p + 1;
        p += 2;
        continue;
      }
      if (c === "`") {
        let n = 0;
        while (p + n < l.to && s[p + n] === "`") n++;
        let q = p + n;
        let close = -1;
        while (q < l.to) {
          if (s[q] !== "`") {
            q++;
            continue;
          }
          let k = 0;
          while (q + k < l.to && s[q + k] === "`") k++;
          if (k === n) {
            close = q;
            break;
          }
          q += k;
        }
        if (close >= 0) {
          flush(p);
          this.mark("code-open", p, p + n);
          this.mark("code-close", close, close + n);
          toks.push({ k: "node", node: { t: "code", span: { from: p + n, to: close } } });
          p = close + n;
        } else {
          lit(p);
          p += n;
        }
        continue;
      }
      if (c === "<") {
        const m = AUTOLINK.exec(s.slice(p, l.to));
        if (m) {
          flush(p);
          const span = { from: p + 1, to: p + 1 + m[1].length };
          this.mark("link-open", p, p + 1);
          toks.push({ k: "node", node: { t: "link", href: m[1], span } });
          p = span.to + 1;
          if (linkCloseShown(s, span.to)) lit(span.to);
          else this.mark("link-close", span.to, span.to + 1);
          continue;
        }
        lit(p);
        p++;
        continue;
      }
      if (c === "*") {
        let n = 0;
        while (p + n < l.to && s[p + n] === "*") n++;
        if (n > 3) {
          lit(p);
          p += n;
          continue;
        }
        flush(p);
        const open = p + n < l.to && !isSpace(s, p + n);
        const close = p > l.from && !isSpace(s, p - 1);
        toks.push({ k: "delim", span: { from: p, to: p + n }, n, open, close });
        p += n;
        continue;
      }
      lit(p);
      p++;
    }
    flush(l.to);
    const stack = [];
    toks.forEach((tk, idx) => {
      if (tk.k !== "delim") return;
      if (tk.close) {
        for (let j = stack.length - 1; j >= 0; j--) {
          const o = toks[stack[j]];
          if (o.n === tk.n) {
            o.pair = "open";
            tk.pair = "close";
            stack.length = j;
            return;
          }
        }
      }
      if (tk.open) stack.push(idx);
    });
    for (const j of stack) delete toks[j].pair;
    const root = [];
    const frames = [root];
    const top = () => frames[frames.length - 1];
    for (const tk of toks) {
      if (tk.k === "node") {
        top().push(tk.node);
      } else if (tk.pair === "open") {
        this.mark("em-open", tk.span.from, tk.span.to);
        const outer = [];
        if (tk.n === 1) {
          top().push({ t: "em", children: outer });
          frames.push(outer);
        } else if (tk.n === 2) {
          top().push({ t: "strong", children: outer });
          frames.push(outer);
        } else {
          const inner = [];
          top().push({ t: "strong", children: [{ t: "em", children: inner }] });
          frames.push(inner);
        }
      } else if (tk.pair === "close") {
        this.mark("em-close", tk.span.from, tk.span.to);
        frames.pop();
      } else {
        top().push({ t: "text", span: tk.span });
      }
    }
    return merge(root);
  }
};
function merge(nodes) {
  const out = [];
  for (const n of nodes) {
    const last = out[out.length - 1];
    if (n.t === "text" && last?.t === "text" && last.span.to === n.span.from) {
      last.span = { from: last.span.from, to: n.span.to };
    } else if (n.t === "em" || n.t === "strong") {
      out.push({ t: n.t, children: merge(n.children) });
    } else {
      out.push(n.t === "text" ? { t: "text", span: { ...n.span } } : n);
    }
  }
  return out;
}
function shownIn(doc) {
  const out = [];
  let leaf = 0;
  const span = (x) => {
    for (let i = x.from; i < x.to; i++) out.push([i, leaf]);
  };
  const inl = (ns) => {
    for (const n of ns) {
      if (n.t === "text" || n.t === "code" || n.t === "link") span(n.span);
      else if (n.t === "break") out.push([n.at, leaf]);
      else inl(n.children);
    }
  };
  const blk = (bs) => {
    for (const b of bs) {
      switch (b.t) {
        case "heading":
        case "paragraph":
          leaf++;
          inl(b.children);
          break;
        case "quote":
          blk(b.children);
          break;
        case "list":
          for (const it of b.items) {
            leaf++;
            span(it.marker);
            blk(it.children);
          }
          break;
        case "code":
          leaf++;
          if (b.label) span(b.label);
          leaf++;
          b.lines.forEach((l, k) => {
            span(l);
            if (k + 1 < b.lines.length) out.push([l.to, leaf]);
          });
          break;
        case "rule":
          break;
      }
    }
  };
  blk(doc.blocks);
  return out;
}
var PERCENT_SIGNS = /* @__PURE__ */ new Set([37, 1642, 65130, 65285, 8240, 1545, 8241]);
var SIGNS = /* @__PURE__ */ new Set([43, 45, 8722, 8211, 65123, 65293]);
var STOPS = /* @__PURE__ */ new Set([
  // Full stops.
  46,
  1417,
  1748,
  1793,
  1794,
  4962,
  5742,
  6147,
  6153,
  11513,
  11518,
  11836,
  12290,
  42239,
  42510,
  42739,
  65042,
  65106,
  65294,
  65377,
  92917,
  93848,
  113823,
  121480,
  // Commas.
  44,
  1373,
  1548,
  2040,
  4963,
  6146,
  6152,
  11826,
  11828,
  11841,
  11849,
  11852,
  12289,
  42238,
  42509,
  42741,
  65040,
  65041,
  65104,
  65105,
  65292,
  65380,
  70733,
  70746,
  93847,
  121479,
  // The Arabic decimal and thousands separators.
  1643,
  1644
]);
var APOSTROPHES = /* @__PURE__ */ new Set([39, 8217, 1370, 65287]);
var MARKS_QE = /* @__PURE__ */ new Set([
  63,
  191,
  894,
  1374,
  1567,
  4967,
  6469,
  8263,
  8265,
  11514,
  11515,
  11822,
  11860,
  42511,
  42743,
  65046,
  65110,
  65311,
  69955,
  125279,
  33,
  161,
  1372,
  2041,
  6468,
  8252,
  8264,
  11859,
  65045,
  65111,
  65281,
  125278,
  8253,
  11800
]);
var DIGIT = /^\p{N}$/u;
var LETTER = /^\p{L}$/u;
var MARK = /^\p{M}$/u;
var ALWAYS = /^[\p{L}\p{N}\p{M}]$/u;
var CURRENCY = /^\p{Sc}$/u;
var MATHS = /^\p{Sm}$/u;
var OPEN_BRACKET = /^\p{Ps}$/u;
var CLOSE_BRACKET = /^\p{Pe}$/u;
function charAt(s, i) {
  if (i < 0 || i >= s.length) return null;
  let from = i;
  const u = s.charCodeAt(i);
  if (u >= 56320 && u <= 57343 && i > 0) {
    const h = s.charCodeAt(i - 1);
    if (h >= 55296 && h <= 56319) from = i - 1;
  }
  const c = String.fromCodePoint(s.codePointAt(from));
  return { c, from, to: from + c.length };
}
var charBefore = (s, i) => i > 0 ? charAt(s, i - 1) : null;
var isDigit = (x) => x !== null && DIGIT.test(x.c);
function letterBefore(s, i) {
  let x = charBefore(s, i);
  while (x && MARK.test(x.c)) x = charBefore(s, x.from);
  return x !== null && LETTER.test(x.c);
}
function inAmount(c) {
  const cp = c.codePointAt(0);
  return DIGIT.test(c) || CURRENCY.test(c) || SIGNS.has(cp) || STOPS.has(cp) || PERCENT_SIGNS.has(cp) || APOSTROPHES.has(cp) || SPACES.has(cp);
}
function aroundAmount(s, from, to, open) {
  let digits = 0;
  let edge = null;
  let x = open ? charAt(s, to) : charBefore(s, from);
  const first = x;
  while (x && inAmount(x.c)) {
    if (DIGIT.test(x.c)) digits++;
    edge = x;
    x = open ? charAt(s, x.to) : charBefore(s, x.from);
  }
  if (!x || !digits || !first || !edge) return false;
  if (SPACES.has(first.c.codePointAt(0)) || SPACES.has(edge.c.codePointAt(0))) return false;
  return open ? CLOSE_BRACKET.test(x.c) : OPEN_BRACKET.test(x.c);
}
var FLOOR = [
  ["a letter, a digit or a combining mark", (h) => ALWAYS.test(h.c)],
  ["a currency sign", (h) => CURRENCY.test(h.c)],
  ["a mathematical sign next to a digit", (h) => MATHS.test(h.c) && (isDigit(h.before) || isDigit(h.after))],
  ["a percent, per-mille or per-ten-thousand sign", (h) => PERCENT_SIGNS.has(h.cp)],
  ["a character between two digits", (h) => isDigit(h.before) && isDigit(h.after)],
  [
    "a plus or minus sign directly before a digit or a currency sign, or directly after a digit",
    (h) => SIGNS.has(h.cp) && (isDigit(h.after) || h.after !== null && CURRENCY.test(h.after.c) || isDigit(h.before))
  ],
  ["a full stop or comma directly before a digit", (h) => STOPS.has(h.cp) && isDigit(h.after)],
  [
    "a bracket directly around an amount",
    (h) => OPEN_BRACKET.test(h.c) && aroundAmount(h.s, h.from, h.to, true) || CLOSE_BRACKET.test(h.c) && aroundAmount(h.s, h.from, h.to, false)
  ],
  [
    "a space or apostrophe between two letters",
    (h) => (SPACES.has(h.cp) || APOSTROPHES.has(h.cp)) && h.after !== null && LETTER.test(h.after.c) && letterBefore(h.s, h.from)
  ],
  ["a question or exclamation mark", (h) => MARKS_QE.has(h.cp)]
];
function underFloor(s, i) {
  const here = charAt(s, i);
  if (!here) return null;
  const h = { s, c: here.c, cp: here.c.codePointAt(0), from: here.from, to: here.to, before: charBefore(s, here.from), after: charAt(s, here.to) };
  for (const [why, holds] of FLOOR) if (holds(h)) return why;
  return null;
}
function checkBound(doc, declared = DECLARED, endsBlock = ENDS_BLOCK) {
  const s = doc.source;
  const n = s.length;
  const at = shownIn(doc);
  const state2 = new Uint8Array(n);
  const leafOf = new Int32Array(n).fill(-1);
  let last = -1;
  for (const [i, leaf] of at) {
    if (i < 0 || i >= n) return `shows offset ${i}, outside the text`;
    if (i <= last) return `shows offset ${i} after ${last}: out of the order of the bytes`;
    last = i;
    state2[i] = 1;
    leafOf[i] = leaf;
  }
  const prevShown = new Int32Array(n + 1).fill(-1);
  for (let i = 0; i < n; i++) prevShown[i + 1] = state2[i] ? i : prevShown[i];
  const nextShown = new Int32Array(n + 1).fill(-1);
  for (let i = n - 1; i >= 0; i--) nextShown[i] = state2[i] ? i : nextShown[i + 1];
  const endsABlock = (i) => {
    if (s[i] !== "\n" || !endsBlock.includes("\n")) return false;
    const a = prevShown[i];
    const b = nextShown[i];
    return a >= 0 && b >= 0 && leafOf[a] !== leafOf[b];
  };
  const floor = (i, why) => `hides ${JSON.stringify(s[i])} at ${i}, which no format may hide (F167): ${why}`;
  const ruleAt = /* @__PURE__ */ new Map();
  for (const m of doc.marks) for (let i = m.span.from; i < m.span.to; i++) ruleAt.set(i, m.rule);
  const emphasisOrCode = (i) => {
    const rule = ruleAt.get(i);
    return rule === "em-open" || rule === "em-close" || rule === "code-open" || rule === "code-close";
  };
  const BETWEEN = "a character between two digits";
  for (let i = 0; i < n; i++) {
    if (state2[i]) continue;
    const why = underFloor(s, i);
    if (why === BETWEEN && endsABlock(i)) continue;
    if (why === BETWEEN && emphasisOrCode(i)) return floor(i, "emphasis or code markup between two digits");
    if (why) return floor(i, why);
  }
  for (let a = 0; a < n; ) {
    if (state2[a]) {
      a++;
      continue;
    }
    let b = a;
    while (b < n && !state2[b]) b++;
    const before = charBefore(s, a);
    const after = charAt(s, b);
    let newBlock = false;
    for (let i = a; i < b && !newBlock; i++) newBlock = endsABlock(i);
    if (isDigit(before) && isDigit(after) && !newBlock) {
      for (let i = a; i < b; i++) if (emphasisOrCode(i)) return floor(i, "emphasis or code markup between two digits");
      return floor(a, "a run of hidden characters between two digits");
    }
    a = b;
  }
  const said = (i) => JSON.stringify(s[i] ?? "");
  const lineStart = (i) => s.lastIndexOf("\n", i - 1) + 1;
  const lineEnd = (i) => {
    const e = s.indexOf("\n", i);
    return e < 0 ? n : e;
  };
  const markers = new Uint8Array(n);
  const markerSpans = (bs) => {
    for (const b of bs) {
      if (b.t === "quote") markerSpans(b.children);
      if (b.t === "list")
        for (const it of b.items) {
          for (let i = it.marker.from; i < it.marker.to; i++) markers[i] = 1;
          markerSpans(it.children);
        }
    }
  };
  markerSpans(doc.blocks);
  const container = new Uint8Array(n);
  for (const m of doc.marks)
    if (m.rule === "quote" || m.rule === "indent" || m.rule === "item")
      for (let i = m.span.from; i < m.span.to; i++) container[i] = 1;
  const opensLine = (i) => {
    for (let j = lineStart(i); j < i; j++) if (!container[j] && !markers[j]) return false;
    return true;
  };
  const escaped = new Uint8Array(n + 1);
  for (const m of doc.marks) if (m.rule === "escape") escaped[m.span.to] = 1;
  const run = (i, c) => {
    let a = i;
    let b = i;
    while (a > lineStart(i) && s[a - 1] === c && !escaped[a - 1]) a--;
    while (b < lineEnd(i) && s[b] === c && !escaped[b]) b++;
    return { from: a, to: b };
  };
  const isSpaceAt = (i) => i >= 0 && i < n && SPACES.has(s.charCodeAt(i));
  const wholeRun = (m, c) => {
    const r = run(m.span.from, c);
    return r.from === m.span.from && r.to === m.span.to;
  };
  const sameLine = (a, b) => lineEnd(a.span.from) === lineEnd(b.span.from);
  const closeShown = (i) => linkCloseShown(s, i);
  const stack = [];
  let code = null;
  let link = null;
  for (const m of doc.marks) {
    const { from, to } = m.span;
    if (from < 0 || to > n || from >= to) return `declares markup outside the text at ${from}`;
    for (let i = from; i < to; i++) {
      if (state2[i]) return `hides ${said(i)} at ${i}, which it also shows`;
      if (!declared[m.rule].includes(s[i])) return `hides ${said(i)} at ${i}, which is not ${m.rule} markup`;
      state2[i] = 2;
    }
    const text = s.slice(from, to);
    const fail2 = (why) => `hides ${JSON.stringify(text)} at ${from}, not in a declared position: ${why}`;
    switch (m.rule) {
      case "heading":
        if (!/^#{1,6} $/.test(text) || !opensLine(from) || to >= lineEnd(from)) return fail2("one to six # and a space, opening a line, before some text");
        break;
      case "rule":
        if (!opensLine(from) || to !== lineEnd(from) || !/^(?:-{3,}|\*{3,})$/.test(text)) return fail2("a whole line of three or more - or *");
        break;
      case "fence-open":
        if (!opensLine(from) || to - from < 3 || !wholeRun(m, "`") || s.slice(to, lineEnd(from)).includes("`")) return fail2("three or more backticks opening a line, nothing after them a backtick");
        break;
      case "fence-close":
        if (!opensLine(from) || to !== lineEnd(from)) return fail2("a whole line of backticks");
        break;
      case "quote":
        if (s[from] !== ">" || to - from === 2 && s[from + 1] !== " " || !opensLine(from)) return fail2("a > and one space, opening a line");
        break;
      case "item":
        if (from === 0 || !markers[from - 1] || to - from !== 1) return fail2("the one space after a list marker");
        break;
      case "indent":
        if (!opensLine(from) || !/^ +$/.test(text)) return fail2("spaces opening an item's later line");
        break;
      case "escape":
        if (to - from !== 1 || to >= lineEnd(from) || !ESCAPABLE.has(s[to]) || state2[to] !== 1) return fail2("a backslash before a character it escapes");
        break;
      case "code-open":
        if (code || !wholeRun(m, "`")) return fail2("a whole run of backticks opening a code span");
        code = m;
        break;
      case "code-close":
        if (!code || !sameLine(code, m) || !wholeRun(m, "`") || to - from !== code.span.to - code.span.from) return fail2("a run of as many backticks closing a code span on its line");
        code = null;
        break;
      case "link-open": {
        const a = AUTOLINK.exec(s.slice(from, lineEnd(from)));
        if (!a || link) return fail2("a < opening a link to an https, http or mailto address");
        const close = from + a[0].length - 1;
        if (state2[close] === 1) {
          if (!closeShown(close)) return fail2("a link whose closing > is shown, though not next to a digit");
        } else link = m;
        break;
      }
      case "link-close": {
        const a = link && AUTOLINK.exec(s.slice(link.span.from, lineEnd(link.span.from)));
        if (!link || !a || link.span.from + a[0].length !== to) return fail2("the > closing a link");
        if (closeShown(from)) return fail2("the > closing a link, next to a digit, is shown");
        link = null;
        break;
      }
      case "em-open":
        if (to - from > 3 || !wholeRun(m, "*") || to >= lineEnd(from) || isSpaceAt(to)) return fail2("a run of one to three * before a character not a space");
        stack.push(m);
        break;
      case "em-close": {
        const o = stack.pop();
        if (to - from > 3 || !wholeRun(m, "*") || from <= lineStart(from) || isSpaceAt(from - 1)) return fail2("a run of one to three * after a character not a space");
        if (!o || !sameLine(o, m) || o.span.to - o.span.from !== to - from) return fail2("no opener of its length on its line");
        break;
      }
    }
  }
  if (stack.length || code || link) return "an opening sign is never closed on its line";
  let prev = -1;
  const next = new Int32Array(n + 1).fill(-1);
  for (let i = n - 1; i >= 0; i--) next[i] = state2[i] === 1 ? i : next[i + 1];
  for (let i = 0; i < n; i++) {
    if (state2[i] === 1) {
      prev = i;
      continue;
    }
    if (state2[i] === 2) continue;
    if (!endsBlock.includes(s[i])) return `hides ${said(i)} at ${i}, which is not markup`;
    const after = next[i + 1] ?? -1;
    if (prev >= 0 && after >= 0 && leafOf[prev] === leafOf[after]) return `hides the LF at ${i}, inside a block`;
  }
  return null;
}

// ../longform/src/html.ts
var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ESC[c]);
var STYLE = `.mor-lf{white-space:pre-wrap;overflow-wrap:anywhere}
.mor-lf :is(h1,h2,h3,h4,h5,h6,p,li,blockquote,pre){unicode-bidi:isolate}
.mor-lf ul,.mor-lf ol{list-style:none;padding-left:0}
.mor-lf li{display:flex;gap:.5em}
.mor-lf li>.mor-lf-marker{flex:none}
.mor-lf li>div{flex:1;min-width:0}
.mor-lf li>div>:first-child{margin-top:0}
.mor-lf li>div>:last-child{margin-bottom:0}
.mor-lf li{margin:.25em 0}
.mor-lf blockquote{margin-left:0;padding-left:1em;border-left:3px solid currentColor}
.mor-lf pre{overflow-x:auto}
.mor-lf .mor-lf-label{display:block;font-size:.85em;opacity:.8}
.mor-lf-plain{white-space:pre-wrap;overflow-wrap:anywhere;font-family:ui-monospace,monospace}
.mor-lf-ctl{outline:1px solid currentColor;font-size:.8em}`;
function renderHtml(doc) {
  const breach = checkBound(doc);
  if (breach) {
    return `<div class="mor-lf"><p class="mor-lf-refused">Shown plain: the long-form rendering would break the Text MIP's bound (${escapeHtml(breach)}).</p>${plainHtml(doc.source, { showControls: true })}</div>`;
  }
  const s = doc.source;
  const text = (x) => escapeHtml(s.slice(x.from, x.to));
  const inl = (ns) => ns.map((n) => {
    switch (n.t) {
      case "text":
        return text(n.span);
      case "break":
        return "<br>";
      case "em":
        return `<em>${inl(n.children)}</em>`;
      case "strong":
        return `<strong>${inl(n.children)}</strong>`;
      case "code":
        return `<code>${text(n.span)}</code>`;
      case "link":
        return `<a href="${escapeHtml(n.href)}" rel="nofollow noopener noreferrer">${text(n.span)}</a>`;
    }
  }).join("");
  const blk = (bs) => bs.map((b) => {
    switch (b.t) {
      case "heading":
        return `<h${b.level} dir="auto">${inl(b.children)}</h${b.level}>`;
      case "paragraph":
        return `<p dir="auto">${inl(b.children)}</p>`;
      case "quote":
        return `<blockquote>${blk(b.children)}</blockquote>`;
      case "list": {
        const tag = b.ordered ? "ol" : "ul";
        const items = b.items.map((it) => `<li><span class="mor-lf-marker">${text(it.marker)}</span><div>${blk(it.children)}</div></li>`).join("");
        return `<${tag}>${items}</${tag}>`;
      }
      case "code": {
        const label = b.label ? `<span class="mor-lf-label">${text(b.label)}</span>` : "";
        return `<pre dir="auto">${label}<code>${b.lines.map(text).join("\n")}</code></pre>`;
      }
      case "rule":
        return "<hr>";
    }
  }).join("");
  return `<div class="mor-lf">${blk(doc.blocks)}</div>`;
}
var INVISIBLE = /[\u061C\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
function plainHtml(source, opts = {}) {
  if (!opts.showControls) return `<div class="mor-lf-plain" dir="ltr">${escapeHtml(source)}</div>`;
  let out = "";
  let last = 0;
  for (const m of source.matchAll(INVISIBLE)) {
    const cp = m[0].codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
    out += escapeHtml(source.slice(last, m.index)) + `<span class="mor-lf-ctl" title="invisible character">U+${cp}</span>`;
    last = m.index + m[0].length;
  }
  out += escapeHtml(source.slice(last));
  return `<div class="mor-lf-plain" dir="ltr">${out}</div>`;
}

// ../barebone/src/html.ts
var short = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
var STYLE2 = `${STYLE}
.mor-post{border:1px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:8px;padding:12px 16px;margin:16px 0}
.mor-post-by{font-size:.85em;opacity:.8;overflow-wrap:anywhere}
.mor-post-by code{font-size:.95em}
.mor-post-text{margin:.75em 0;white-space:pre-wrap;overflow-wrap:anywhere}
.mor-post figure{margin:.75em 0}
.mor-post img{display:block;max-width:100%;height:auto;image-orientation:from-image}
.mor-post figcaption{font-size:.8em;opacity:.8;overflow-wrap:anywhere}
.mor-post-missing{font-size:.9em;padding:.5em;border:1px dashed currentColor;border-radius:4px}
.mor-post-bad{font-weight:bold}`;
function standingWords(s) {
  return s === "valid" ? "verified" : `not verified: ${s}`;
}
function picture(p, poster) {
  const by = p.signer === poster ? "" : ` A picture by <code>${short(p.signer)}</code>, not by the poster.`;
  if (!p.bytes || !p.picture) {
    return `<figure><div class="mor-post-missing">Picture not shown: ${escapeHtml(p.problem ?? "unknown")}.${by}</div></figure>`;
  }
  const src = `data:image/jpeg;base64,${base64(p.bytes)}`;
  const still = p.picture.carries.length ? ` It still carries ${p.picture.carries.map((c) => CARRIED_WORDS[c]).join("; ")}, not shown.` : "";
  return `<figure><img src="${src}" width="${p.picture.shownWidth}" height="${p.picture.shownHeight}" alt="">
<figcaption>JPEG, ${p.picture.shownWidth} \xD7 ${p.picture.shownHeight}, publication <code>${short(p.publication)}</code>, ${standingWords(p.standing)}.${by}${still}</figcaption></figure>`;
}
function renderPost(p) {
  const text = p.format === POST_SPECS.longform ? renderHtml(parse(p.text)) : `<div class="mor-post-text" dir="auto">${escapeHtml(p.text)}</div>`;
  const others = p.refs.filter((r) => r.kind === "act").map((r) => `<div class="mor-post-by">Refers to <code>${short(r.id)}</code>: ${escapeHtml(r.kind === "act" ? r.what : "")}.</div>`).join("");
  const pictures = p.refs.filter((r) => r.kind === "picture").map((r) => picture(r, p.signer)).join("");
  const bad = p.standing === "valid" ? "" : " mor-post-bad";
  return `<article class="mor-post">
<div class="mor-post-by${bad}">By <code title="${p.signer}">${short(p.signer)}</code>, ${standingWords(p.standing)}. Post <code title="${p.id}">${short(p.id)}</code>.</div>
${text}${pictures}${others}
<details><summary>Plain text</summary>${plainHtml(p.text, { showControls: true })}</details>
</article>`;
}

// src/manifest.ts
var KINDS = { html: "page", css: "stylesheet", jpg: "picture", txt: "text" };
var FRONT = "index.html";
var SEGMENT = /^[a-z0-9_-][a-z0-9._-]{0,99}$/;
function kindOf(path) {
  if (typeof path !== "string" || !path || path.length > 512) return null;
  const segments2 = path.split("/");
  if (!segments2.every((s) => SEGMENT.test(s))) return null;
  const last = segments2.at(-1);
  const dot = last.lastIndexOf(".");
  if (dot <= 0) return null;
  return KINDS[last.slice(dot + 1)] ?? null;
}
var validPath = (p) => kindOf(p) !== null;
var byBytes = (a, b) => a < b ? -1 : a > b ? 1 : 0;
function decodeSite(bytes) {
  const m = cborDecode(bytes);
  if (!(m instanceof Map)) throw new Error("a site manifest is a map");
  for (const k of m.keys()) if (k !== 0 && k !== 1 && k !== 2) throw new Error(`site manifest: unknown field ${String(k)}`);
  const name = m.get(0);
  if (typeof name !== "string") throw new Error("site manifest: name");
  try {
    checkText(name);
  } catch {
    throw new Error("site manifest: the name is not canonical text");
  }
  const prev = m.get(1);
  if (prev !== null && !(prev instanceof Uint8Array && prev.length === 32)) throw new Error("site manifest: previous");
  const list = m.get(2);
  if (!Array.isArray(list) || !list.length) throw new Error("site manifest: no files");
  const bytesOf = (v, n, w) => {
    if (!(v instanceof Uint8Array) || v.length !== n) throw new Error(`site manifest: ${w}`);
    return v;
  };
  const files = list.map((x) => {
    if (!Array.isArray(x) || x.length !== 6) throw new Error("site manifest: a file has six fields");
    const [path, work, size, locked, nonce, key] = x;
    if (typeof path !== "string" || !validPath(path)) throw new Error(`site manifest: not a valid path: ${JSON.stringify(path)}`);
    if (typeof size !== "number" || !Number.isSafeInteger(size) || size < 0) throw new Error("site manifest: file size");
    return {
      path,
      work: hex(bytesOf(work, 32, "work hash")),
      size,
      locked: hex(bytesOf(locked, 32, "locked hash")),
      nonce: bytesOf(nonce, 24, "nonce"),
      key: bytesOf(key, 32, "key")
    };
  });
  files.forEach((f, i) => {
    if (i && byBytes(files[i - 1].path, f.path) >= 0) throw new Error("site manifest: paths sorted and unique");
  });
  if (!files.some((f) => f.path === FRONT)) throw new Error("site manifest: no front page (index.html)");
  return { name, previous: prev === null ? null : hex(prev), files };
}
function pathFor(address) {
  if (!address.startsWith("/")) return null;
  let p = address.slice(1);
  if (p === "" || p.endsWith("/")) p += FRONT;
  return validPath(p) ? p : null;
}
function addressOf(path) {
  return "/" + (path === FRONT ? "" : path.endsWith(`/${FRONT}`) ? path.slice(0, -FRONT.length) : path);
}
function resolveRef(page, ref) {
  if (!ref || /^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith("//")) return null;
  const clean2 = ref.split("#")[0].split("?")[0];
  if (!clean2) return page;
  const parts = clean2.startsWith("/") ? [] : page.split("/").slice(0, -1);
  for (const s of clean2.split("/")) {
    if (s === "" || s === ".") continue;
    if (s === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(s);
  }
  let p = parts.join("/");
  if (clean2.endsWith("/") || p === "") p = p ? `${p}/${FRONT}` : FRONT;
  return validPath(p) ? p : null;
}

// src/settings.ts
var HEX64 = /^[0-9a-f]{64}$/;
function relayAddress(s) {
  if (typeof s !== "string") return null;
  let u;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const local = u.hostname === "127.0.0.1" || u.hostname === "localhost" || u.hostname === "[::1]";
  if (u.protocol !== "https:" && !(u.protocol === "http:" && local)) return null;
  if (u.username || u.password || u.search || u.hash) return null;
  return s.replace(/\/$/, "");
}
function common(o, where) {
  if (typeof o.version !== "string" || !HEX64.test(o.version)) throw new Error(`${where}: "version" must be an act id, 64 hex digits`);
  if (typeof o.identity !== "string" || !HEX64.test(o.identity)) throw new Error(`${where}: "identity" must be 64 hex digits`);
  const name = typeof o.name === "string" && o.name.trim() ? o.name.trim() : "the owner of this identity";
  const relays = (Array.isArray(o.relays) ? o.relays : []).map(relayAddress);
  if (!relays.length || relays.some((r) => r === null)) throw new Error(`${where}: "relays" must list https addresses`);
  const serve = o.serve ?? "latest";
  if (serve !== "latest" && serve !== "pinned") throw new Error(`${where}: "serve" is "latest" or "pinned"`);
  return { version: o.version, identity: o.identity, name, relays, serve };
}
function release(v, where) {
  if (v === void 0 || v === null) return null;
  if (typeof v !== "string" || !HEX64.test(v)) throw new Error(`${where}: "release" must be an act id, 64 hex digits`);
  return v;
}
function parseSiteSettings(raw) {
  if (!raw || typeof raw !== "object") throw new Error("the settings are not an object");
  const o = raw;
  return { ...common(o, "settings"), release: release(o.release, "settings") };
}

// src/specs.ts
var test3 = (s) => sha2562(s);
var SITE_SPECS = {
  identity: SPECS.identity,
  /** The Envelope MIP (`ENVELOPE`): a version is a publication. */
  envelope: SPECS.envelope,
  /** The Law MIP (`LAW`): only to tell that a signer is a collective. */
  law: test3("LAW, test value until the freeze"),
  /** The website cMIP (cmips/cmip-website-draft-2.md). */
  site: test3("website cMIP, draft 2, test value until publication")
};
var SITE_LAW_SPECS = { ...MIPS, law: SITE_SPECS.law };
var PUBLICATION2 = 0;
var WITHDRAWAL2 = 3;

// src/verify.ts
async function fetchAct2(id, hints, via) {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
    }
  }
  return null;
}
async function openVersion(version, expected, hints, via = {}) {
  const r = { ok: false, version, expected, places: [...hints], problems: [] };
  const fail2 = (p) => (r.problems.push(p), r);
  if (!/^[0-9a-f]{64}$/.test(version)) return fail2("the version named is not an act id");
  const act = await fetchAct2(version, hints, via);
  if (!act) return fail2(`the version ${version} was not found at ${hints.join(", ")}`);
  let d;
  try {
    d = describeAct(act);
  } catch (e) {
    return fail2(`the version is not a valid act: ${e instanceof Error ? e.message : e}`);
  }
  if (!d.public || !d.payload) return fail2("the version is not a public act");
  if (d.spec !== SITE_SPECS.envelope || d.type !== PUBLICATION2) return fail2("the version is not a publication (Envelope type 0)");
  if (!d.signer) return fail2("the version has no signer");
  r.signer = d.signer;
  let media;
  try {
    media = cborDecode(d.payload);
  } catch {
    return fail2("the publication does not decode");
  }
  const spec = media.get(0);
  if (!(spec instanceof Uint8Array) || hex(spec) !== SITE_SPECS.site) return fail2("the publication is not a site manifest");
  const named = Array.isArray(media.get(6)) ? media.get(6).filter((x) => typeof x === "string") : [];
  r.places = [...hints, ...named.filter((n) => !hints.includes(n))];
  const v = new Verifier(SITE_SPECS.identity);
  try {
    await lookUp(d.signer, r.places, via, v);
  } catch (e) {
    return fail2(`the signer's identity was not found: ${e instanceof Error ? e.message : e}`);
  }
  v.add(act);
  r.standing = v.status(version);
  if (d.signer !== expected) fail2(`signed by ${d.signer}, not by the identity expected (${expected})`);
  if (r.standing !== "valid") fail2(`the version is ${r.standing}, not valid, for its signer's identity chain`);
  const res = v.resolve(d.signer);
  for (const link of res.links) {
    if (v.lawDeclared(SITE_LAW_SPECS, d.signer, link.act)) {
      fail2("the signer is a collective (its chain declares an agreement): a collective's site counts only once Law draft 7 is approved, under its Envelope lane (website cMIP, rule 3)");
      break;
    }
  }
  const w = await findWithdrawal2(version, d.signer, r.places, via, v);
  if (w) {
    r.withdrawn = w;
    fail2(`withdrawn by its signer (act ${w})`);
  }
  const work = media.get(1);
  const locked = media.get(2);
  const size = media.get(3);
  const nonce = media.get(4);
  const key = media.get(5);
  if (!(key instanceof Uint8Array)) return fail2("the manifest is locked: its key is not public");
  if (!(work instanceof Uint8Array) || !(locked instanceof Uint8Array) || typeof size !== "number" || !(nonce instanceof Uint8Array)) {
    return fail2("the publication does not describe its manifest");
  }
  const bytes = await fetchMedia(hex(locked), r.places, via);
  if (!bytes) return fail2("the manifest was not found");
  try {
    const plain = openMedia(bytes, key, nonce);
    if (workHash(plain) !== hex(work) || plain.length !== size) return fail2("the manifest does not match its work hash or size");
    r.manifest = decodeSite(plain);
  } catch (e) {
    return fail2(`the manifest: ${e instanceof Error ? e.message : e}`);
  }
  r.ok = r.problems.length === 0;
  return r;
}
async function findWithdrawal2(version, signer, hints, via, v) {
  for (const h of hints) {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via).feed({ signer, after });
      } catch {
        break;
      }
      for (const it of page.items) {
        if (it.kind !== "act") continue;
        let d;
        try {
          d = describeAct(it.item);
        } catch {
          continue;
        }
        if (d.spec !== SITE_SPECS.envelope || d.type !== WITHDRAWAL2 || d.signer !== signer) continue;
        if (!(d.objects ?? []).some(([chain]) => chain === version)) continue;
        try {
          v.add(it.item);
        } catch {
          continue;
        }
        if (v.status(d.id) === "valid") return d.id;
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  return null;
}
async function fetchMedia(lockedHash, hints, via) {
  for (const h of hints) {
    try {
      const b = await relayAt(h, via).getMedia(lockedHash);
      if (b) return b;
    } catch {
    }
  }
  return null;
}
function matches(entry, bytes) {
  return bytes.length === entry.size && workHash(bytes) === entry.work;
}

// src/latest.ts
async function candidates(signer, places, via) {
  const found = /* @__PURE__ */ new Map();
  for (const h of places) {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via).feed({ signer, after });
      } catch {
        break;
      }
      for (const it of page.items) {
        if (it.kind !== "act") continue;
        let d;
        try {
          d = describeAct(it.item);
        } catch {
          continue;
        }
        if (found.has(d.id) || d.signer !== signer || !d.public || !d.payload) continue;
        if (d.spec !== SITE_SPECS.envelope || d.type !== PUBLICATION2) continue;
        const previous = await previousOf(d.payload, places, via);
        if (previous !== void 0) found.set(d.id, { id: d.id, previous });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  return [...found.values()];
}
async function previousOf(payload, places, via) {
  try {
    const media = cborDecode(payload);
    const spec = media.get(0);
    if (!(spec instanceof Uint8Array) || hex(spec) !== SITE_SPECS.site) return void 0;
    const [work, locked, size, nonce, key] = [1, 2, 3, 4, 5].map((k) => media.get(k));
    if (!(locked instanceof Uint8Array) || !(key instanceof Uint8Array) || !(nonce instanceof Uint8Array) || !(work instanceof Uint8Array)) return void 0;
    for (const h of places) {
      let bytes = null;
      try {
        bytes = await relayAt(h, via).getMedia(hex(locked));
      } catch {
        continue;
      }
      if (!bytes) continue;
      const plain = openMedia(bytes, key, nonce);
      if (workHash(plain) !== hex(work) || plain.length !== size) return void 0;
      return decodeSite(plain).previous;
    }
  } catch {
  }
  return void 0;
}
async function findLater(from, via = {}) {
  const r = { latest: from, after: [], fork: [] };
  if (!from.ok || !from.signer) return r;
  const all = await candidates(from.signer, from.places, via);
  const seen = /* @__PURE__ */ new Set([from.version]);
  for (; ; ) {
    const named = all.filter((c) => c.previous === r.latest.version && !seen.has(c.id));
    const valid = [];
    for (const c of named) {
      seen.add(c.id);
      const v = await openVersion(c.id, from.expected, from.places, via);
      if (v.ok) valid.push(v);
    }
    if (valid.length === 1) {
      r.latest = valid[0];
      r.after.push(valid[0]);
      continue;
    }
    if (valid.length > 1) r.fork = valid.map((v) => v.version).sort();
    return r;
  }
}

// ../reader/src/read.ts
function fingerprint(identity) {
  return identity.match(/.{1,4}/g).join(" ");
}
function standingWords2(s) {
  switch (s) {
    case "valid":
      return { ok: true, words: "Verified: signed by this identity with a key its identity chain counts, checked in this browser." };
    case "pending":
      return { ok: false, words: "Not verified yet: the identity chain it rests on is waiting for its homes to confirm it." };
    case "disputed":
      return { ok: false, words: "Disputed: signed with a key the identity has since replaced; its owner did not keep it, but another identity acknowledged it or a keeper recorded it." };
    case "void":
      return { ok: false, words: "Void: signed with a key the identity has since replaced, and its owner did not keep it." };
    case "invalid":
      return { ok: false, words: "Invalid: the signature or the act does not check." };
    case "scoped":
      return { ok: false, words: "Signed with a grant key: a key of a collective scoped to one of its grants (Law, F128). Whether the grant backs it is Law's to say, and this reader does not judge Law." };
    default:
      return { ok: false, words: `Not verified (${s}): this browser could not establish who signed it.` };
  }
}

// src/shell/view.ts
var FRAME_STYLE = `.mor-act{display:block;margin:1em 0}
.mor-act>iframe{display:block;width:100%;border:0;min-height:4em}
.mor-act-note{font:13px system-ui,sans-serif;padding:8px;border:1px dashed currentColor;border-radius:4px}`;
var ACT_STYLE = `${STYLE2}
:root{color-scheme:light dark}
body{margin:0;background:Canvas;color:CanvasText;font:16px/1.5 Georgia,'Times New Roman',serif}
.mor-post{margin:0}`;
function actItem(a) {
  if (a.problem) return `<li><code>${escapeHtml(a.id)}</code>: <span class="bad-word">not shown</span>, ${escapeHtml(a.problem)}</li>`;
  if (!a.standing) return `<li><code>${escapeHtml(a.id)}</code>: checking\u2026</li>`;
  const w = standingWords2(a.standing);
  return `<li><code>${escapeHtml(a.id)}</code>: <span class="${w.ok ? "ok-word" : "bad-word"}">${w.ok ? "verified" : escapeHtml(a.standing)}</span>, signed by <span class="fp">${fingerprint(a.signer)}</span></li>`;
}
function bar(s) {
  const set = s.settings;
  const v = s.version;
  const rows = [];
  if (v?.signer) {
    rows.push(`<dt>Signed by</dt><dd><span class="fp" id="mor-signer">${fingerprint(v.signer)}</span></dd>`);
    if (set) {
      rows.push(
        v.signer === set.identity ? `<dt>Whose</dt><dd>The identity this gateway names as ${escapeHtml(set.name)}. The name is the gateway's setting; the identity is what was checked.</dd>` : `<dt>Whose</dt><dd><strong>Not the identity this gateway names as ${escapeHtml(set.name)}</strong>, which is <span class="fp">${fingerprint(set.identity)}</span>.</dd>`
      );
    }
  } else if (set) {
    rows.push(`<dt>Expected from</dt><dd><span class="fp">${fingerprint(set.identity)}</span>, named by this gateway as ${escapeHtml(set.name)}</dd>`);
  }
  if (set) {
    rows.push(`<dt>Version</dt><dd><code id="mor-version">${escapeHtml(set.version)}</code>${v?.manifest ? `, the site \u201C${escapeHtml(v.manifest.name)}\u201D` : ""}</dd>`);
    rows.push(
      `<dt>Why this version</dt><dd>${set.serve === "latest" ? "This gateway follows the owner's latest version, as far as it last looked." : "This gateway's operator chose this version, and serves no other."} That is the gateway's setting; this browser looks for later versions itself.</dd>`
    );
  }
  if (s.path) rows.push(`<dt>This file</dt><dd><code>${escapeHtml(s.path)}</code>${s.work ? `, work hash <code>${escapeHtml(s.work)}</code>` : ""}</dd>`);
  if (s.acts.length) rows.push(`<dt>Acts shown</dt><dd><ul id="mor-acts">${s.acts.map(actItem).join("")}</ul></dd>`);
  if (s.reasons.length) rows.push(`<dt>Why</dt><dd><ul id="mor-reasons">${s.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul></dd>`);
  rows.push(
    `<dt>Checked by</dt><dd>This gateway's display client${set?.release ? `, release <code>${escapeHtml(set.release)}</code>` : ""}, running in this browser with MOR's core library. It is served by the gateway, so it is as honest as the gateway: to check without trusting it, verify the version from a relay with your own copy of MOR (<code>mor-site verify</code>), or compare what this gateway serves with the release (<code>mor-site check</code>).</dd>`
  );
  const open = s.phase === "bad" ? " open" : "";
  const newer = s.newer && newerWords(s.newer);
  return `<div class="standing" id="mor-standing">${escapeHtml(s.words)}</div>${newer ? `
<div class="newer" id="mor-newer">${newer}</div>` : ""}
<details${open}><summary>Who signed it, and how to check</summary><dl>${rows.join("")}</dl></details>`;
}
function newerWords(n) {
  const fork = n.fork.length ? `Later versions split: ${n.fork.length} versions, each signed by the same identity, name the same version before them (${n.fork.map((f) => `<code>${escapeHtml(f)}</code>`).join(", ")}). The owner's key may be in someone else's hands; none of them is shown here.` : "";
  const later = n.latest ? `A newer version of this site exists, signed by the same identity: <code id="mor-latest">${escapeHtml(n.latest)}</code>. This gateway serves an earlier one.` : "";
  return [later, fork].filter(Boolean).join(" ");
}
function verifiedWords(settings, kind) {
  return `Verified: this ${kind} is exactly what was signed by the identity this gateway names as ${settings.name}. Checked in this browser.`;
}
var failingWords = (what) => `Failing: ${what} Not shown.`;

// src/shell/page.ts
var DROP = [
  "script",
  "noscript",
  "template",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "applet",
  "portal",
  "form",
  "base",
  "style",
  "video",
  "audio",
  "source",
  "track",
  "svg",
  "math",
  "meta[http-equiv]"
];
var LOADING = ["srcset", "background", "poster", "action", "formaction", "ping", "data", "manifest", "lowsrc", "dynsrc", "xlink:href", "style"];
var ACT = /^[0-9a-f]{64}$/;
function inertCss(css) {
  return css.replace(/@import/gi, "@mor-dropped-import").replace(/url\s*\(/gi, "mor-dropped-url(");
}
async function preparePage(bytes, path, manifest, getFile) {
  const doc = new DOMParser().parseFromString(new TextDecoder("utf-8", { fatal: true }).decode(bytes), "text/html");
  const byPath = new Map(manifest.files.map((f) => [f.path, f]));
  const out = { html: "", title: null, acts: [], problems: [], dropped: 0 };
  const drop = (el) => {
    el.remove();
    out.dropped++;
  };
  const checked = async (entry) => {
    const b = await getFile(entry);
    if (!b) out.problems.push(`${entry.path}, which this page uses, does not match what was signed`);
    return b;
  };
  for (const sel of DROP) for (const el of [...doc.querySelectorAll(sel)]) drop(el);
  for (const el of [...doc.querySelectorAll("*")]) {
    for (const a of [...el.attributes]) {
      const n = a.name.toLowerCase();
      if (n.startsWith("on") || LOADING.includes(n)) {
        el.removeAttribute(a.name);
        out.dropped++;
      }
    }
    const tag = el.localName;
    if (el.hasAttribute("src") && tag !== "img") {
      el.removeAttribute("src");
      out.dropped++;
    }
    if (el.hasAttribute("href") && tag !== "a" && tag !== "area" && tag !== "link") {
      el.removeAttribute("href");
      out.dropped++;
    }
  }
  for (const img of [...doc.querySelectorAll("img")]) {
    const p = resolveRef(path, img.getAttribute("src") ?? "");
    const entry = p ? byPath.get(p) : void 0;
    if (!entry || kindOf(entry.path) !== "picture") {
      drop(img);
      continue;
    }
    const b = await checked(entry);
    if (b) img.setAttribute("src", URL.createObjectURL(new Blob([b], { type: "image/jpeg" })));
    else drop(img);
  }
  for (const link of [...doc.querySelectorAll("link")]) {
    const rel = (link.getAttribute("rel") ?? "").toLowerCase().split(/\s+/);
    const p = rel.includes("stylesheet") ? resolveRef(path, link.getAttribute("href") ?? "") : null;
    const entry = p ? byPath.get(p) : void 0;
    if (!entry || kindOf(entry.path) !== "stylesheet") {
      drop(link);
      continue;
    }
    for (const a of [...link.attributes]) if (a.name !== "rel" && a.name !== "href" && a.name !== "media") link.removeAttribute(a.name);
    const b = await checked(entry);
    if (!b) {
      drop(link);
      continue;
    }
    const css = inertCss(new TextDecoder().decode(b));
    link.setAttribute("href", URL.createObjectURL(new Blob([css], { type: "text/css" })));
  }
  for (const a of [...doc.querySelectorAll("a[href], area[href]")]) {
    const href = a.getAttribute("href").trim();
    for (const attr of ["target", "rel", "download", "referrerpolicy"]) a.removeAttribute(attr);
    let scheme = "";
    try {
      scheme = /^[a-z][a-z0-9+.-]*:/i.test(href) ? new URL(href).protocol : "";
    } catch {
      scheme = "bad:";
    }
    if (scheme === "https:" || scheme === "mailto:") {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      a.setAttribute("title", href);
      continue;
    }
    const p = !scheme && !href.startsWith("#") ? resolveRef(path, href) : null;
    if (p && byPath.has(p)) {
      a.setAttribute("href", addressOf(p));
      a.setAttribute("target", "_top");
      continue;
    }
    if (a.localName === "area") {
      drop(a);
      continue;
    }
    const span = doc.createElement("span");
    span.append(...a.childNodes);
    a.replaceWith(span);
    out.dropped++;
  }
  for (const el of [...doc.querySelectorAll("mor-act")]) {
    const id = (el.getAttribute("act") ?? "").trim();
    const box = doc.createElement("div");
    box.className = "mor-act";
    if (ACT.test(id)) {
      box.setAttribute("data-act", id);
      box.innerHTML = `<div class="mor-act-note">Fetching and checking act <code></code>\u2026</div>`;
      box.querySelector("code").textContent = id;
      out.acts.push(id);
    } else {
      box.innerHTML = `<div class="mor-act-note">Not an act id: <code></code></div>`;
      box.querySelector("code").textContent = id || "(empty)";
    }
    el.replaceWith(box);
  }
  out.title = doc.querySelector("title")?.textContent?.trim() || null;
  const frameStyle = doc.createElement("link");
  frameStyle.rel = "stylesheet";
  frameStyle.href = URL.createObjectURL(new Blob([FRAME_STYLE], { type: "text/css" }));
  doc.head.prepend(frameStyle);
  out.html = `<!doctype html>
${doc.documentElement.outerHTML}`;
  return out;
}

// src/shell/app.ts
var barEl = document.getElementById("mor-bar");
var view = document.getElementById("mor-view");
var message = (err) => err instanceof Error ? err.message : String(err);
var state = {
  phase: "checking",
  words: "Checking this page against what its owner signed\u2026",
  settings: null,
  version: null,
  path: null,
  work: null,
  acts: [],
  reasons: [],
  newer: null
};
function paint() {
  barEl.className = state.phase;
  barEl.innerHTML = bar(state);
}
function fail(what, reasons = []) {
  state.phase = "bad";
  state.words = failingWords(what);
  state.reasons = reasons;
  view.innerHTML = "";
  paint();
}
async function gatewayFile(entry) {
  const r = await fetch(`/_mor/file/${entry.path}`, { cache: "no-store" });
  if (!r.ok) return null;
  const b = new Uint8Array(await r.arrayBuffer());
  return matches(entry, b) ? b : null;
}
async function showActs(frame, settings) {
  const doc = frame.contentDocument;
  if (!doc) return;
  const actStyle = URL.createObjectURL(new Blob([ACT_STYLE], { type: "text/css" }));
  for (const box of [...doc.querySelectorAll(".mor-act[data-act]")]) {
    const id = box.dataset.act;
    const line = state.acts.find((a) => a.id === id);
    try {
      const post = await readPost(id, settings.relays);
      line.standing = post.standing;
      line.signer = post.signer;
      const inner = doc.createElement("iframe");
      inner.setAttribute("sandbox", "allow-same-origin allow-popups allow-popups-to-escape-sandbox");
      inner.setAttribute("title", `Act ${id}`);
      const html = renderPost(post).replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
      inner.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${actStyle}"></head><body>${html}</body></html>`;
      inner.addEventListener("load", () => {
        const d = inner.contentDocument;
        if (!d) return;
        const fit = () => inner.style.height = `${d.documentElement.scrollHeight}px`;
        fit();
        new ResizeObserver(fit).observe(d.body);
      });
      box.replaceChildren(inner);
    } catch (err) {
      line.problem = message(err);
      const note = doc.createElement("div");
      note.className = "mor-act-note";
      note.textContent = `Act ${id} not shown: ${message(err)}.`;
      box.replaceChildren(note);
    }
    paint();
  }
}
async function lookForLater(version) {
  const later = await findLater(version);
  state.newer = { latest: later.latest.version === version.version ? null : later.latest.version, fork: later.fork };
  paint();
  barEl.dataset.looked = "";
}
async function main() {
  paint();
  let settings;
  try {
    const r = await fetch("/_mor/site.json", { cache: "no-store" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    settings = parseSiteSettings(await r.json());
  } catch (err) {
    fail(`this gateway's settings could not be read (${message(err)}).`);
    return;
  }
  state.settings = settings;
  const path = pathFor(location.pathname);
  state.path = path;
  paint();
  const version = await openVersion(settings.version, settings.identity, settings.relays);
  state.version = version;
  if (!version.ok) {
    fail("the site this gateway serves does not verify.", version.problems);
    return;
  }
  const entry = path ? version.manifest.files.find((f) => f.path === path) : void 0;
  if (!entry) {
    document.title = `Not found \xB7 ${version.manifest.name}`;
    fail(`the signed site has no file at this address (${location.pathname}).`, [
      `The site holds: ${version.manifest.files.map((f) => f.path).join(", ")}.`
    ]);
    view.innerHTML = `<p class="note">Nothing here. <a href="/">The front page</a>.</p>`;
    return;
  }
  state.work = entry.work;
  paint();
  let bytes;
  try {
    bytes = await gatewayFile(entry);
  } catch (err) {
    fail(`this page could not be fetched from the gateway (${message(err)}).`);
    return;
  }
  if (!bytes) {
    fail(`what this gateway served for ${entry.path} is not what was signed.`, [
      `Its bytes do not match the work hash and size in the signed manifest. The gateway, or something between it and this browser, altered them.`
    ]);
    return;
  }
  const kind = kindOf(entry.path);
  if (kind === "page") {
    let prepared;
    try {
      prepared = await preparePage(bytes, entry.path, version.manifest, gatewayFile);
    } catch (err) {
      fail(`this page could not be read (${message(err)}).`);
      return;
    }
    if (prepared.problems.length) {
      fail(`a file this page uses is not what was signed.`, prepared.problems);
      return;
    }
    document.title = `${prepared.title ?? entry.path} \xB7 ${version.manifest.name}`;
    state.acts = prepared.acts.map((id) => ({ id, standing: null, signer: null, problem: null }));
    state.phase = "ok";
    state.words = verifiedWords(settings, "page");
    paint();
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-same-origin allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox");
    frame.setAttribute("title", prepared.title ?? entry.path);
    frame.id = "mor-page";
    frame.addEventListener("load", () => void showActs(frame, settings), { once: true });
    frame.srcdoc = prepared.html;
    view.replaceChildren(frame);
    void lookForLater(version);
    return;
  }
  document.title = `${entry.path} \xB7 ${version.manifest.name}`;
  state.phase = "ok";
  state.words = verifiedWords(settings, kind === "picture" ? "picture" : "file");
  paint();
  const box = document.createElement("div");
  box.className = "file";
  if (kind === "picture") {
    const img = document.createElement("img");
    img.alt = entry.path;
    img.src = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    box.append(img);
  } else {
    const pre = document.createElement("pre");
    pre.textContent = new TextDecoder().decode(bytes);
    box.append(pre);
  }
  view.replaceChildren(box);
  void lookForLater(version);
}
void main();
