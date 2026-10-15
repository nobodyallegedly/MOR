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
  addWithKey(bytes2, key) {
    let deferred4_0;
    let deferred4_1;
    try {
      const ptr0 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
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
  add(bytes2) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
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
   * An agreement as held: its parties, who signed, whether it exists (a
   * deal, founding terms) or is ready to be recorded (a collective's
   * clone), and the powers its mark must name. `specs`: the six MIR
   * hashes, and the layers of extensions it adds or drops.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsAgreement(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsAgreement(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsBacking(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBacking(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsBefore(specs, x, line) {
    const ptr0 = passStringToWasm0(x, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(line, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBefore(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * Where Agreements read a collective as broken and a rollback can bring it
   * back (Agreements rule 37d, F185): `{ act, before, reason }`, the broken act
   * (a rotation of the collective), the agreement in force just before
   * it, a rollback's parent, and Agreements' reason; null otherwise.
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  agreementsBrokenAct(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBrokenAct(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Why Agreements read a collective as broken (the agreement its latest key
   * lives under cannot be found: a rotation's declared clone incomplete,
   * a false mark, rules 37 and 45a), or null where it reads it as working.
   * @param {any} specs
   * @param {string} collective
   * @returns {string | undefined}
   */
  agreementsBroken(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBroken(this.__wbg_ptr, specs, ptr0, len0);
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
   * Whether a claim on a work is shown as made after its release: the
   * release, if so (F121, D).
   * @param {any} specs
   * @param {string} claim
   * @param {string} work
   * @returns {string | undefined}
   */
  agreementsClaimAfterRelease(specs, claim, work) {
    const ptr0 = passStringToWasm0(claim, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(work, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsClaimAfterRelease(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
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
  agreementsClosing(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsClosing(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsCollectiveOf(specs, agreement) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsCollectiveOf(this.__wbg_ptr, specs, ptr0, len0);
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
   * Agreements' answer for an act of a collective: which areas reach it, and
   * whether their holders' signature acts meet each (rule 36a, 44d).
   * @param {any} specs
   * @param {string} act
   * @returns {any}
   */
  agreementsConsent(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsConsent(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsCurrent(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsCurrent(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {any} specs
   * @param {string} agreement
   * @returns {any}
   */
  agreementsDealFork(specs, agreement) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDealFork(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A creditor's release, judged (Money type 4, F126; rule 47b):
   * whether it ends the obligation it names (signed by that obligation's
   * creditor, a collective by its Money lane).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsDebtRelease(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDebtRelease(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsDebtors(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDebtors(this.__wbg_ptr, specs, ptr0, len0);
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
   * @param {any} specs
   * @param {string} party
   * @returns {any}
   */
  agreementsDeclarationsNaming(specs, party) {
    const ptr0 = passStringToWasm0(party, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDeclarationsNaming(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The agreement an identity's chain declares at the chain act
   * `binding`, if any (for a rotation: the clone it declares).
   * @param {any} specs
   * @param {string} identity
   * @param {string} binding
   * @returns {string | undefined}
   */
  agreementsDeclared(specs, identity2, binding) {
    const ptr0 = passStringToWasm0(identity2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(binding, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDeclared(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
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
  agreementsDone(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDone(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsEndingActs(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsEndingActs(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * Client conformance (rule 45b, F186): the alarm a seller's client and
   * a split service raise when a payment names a version of the deal that
   * does not descend from the version they hold. Null where it does;
   * else `{ named, held, shared, kind, heldLine, namedLine }`, `kind`
   * "fork" (the alarm), "unheld" (a version this verifier does not hold:
   * the alarm, F189 3) or "older" (a plain notice, F188 DQ7).
   * @param {any} specs
   * @param {string} payment
   * @param {string} held
   * @returns {any}
   */
  agreementsForkAlarm(specs, payment, held) {
    const ptr0 = passStringToWasm0(payment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(held, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsForkAlarm(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
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
  agreementsFork(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsFork(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsHandOut(specs, collective, agreement, chain_act, tips) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(chain_act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsHandOut(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, ptr2, len2, tips);
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
  agreementsInForce(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsInForce(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsLineUnheld(specs, collective, chain_act, tips) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(chain_act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsLineUnheld(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, tips);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
  }
  /**
   * Who counts for a power (`{ form, area }`, as `agreementsClonePlan` gives
   * it) of the collective's agreement in force, at its next line, after
   * every act held (rule 44d), `leaving` taken out: the agreement, the
   * parties counted among, the voices that remain, and how many meet it
   * (null where none remains); or `{ error }`, why there is no such count.
   * @param {any} specs
   * @param {string} collective
   * @param {any} power
   * @param {string[]} leaving
   * @returns {any}
   */
  agreementsNextVoices(specs, collective, power, leaving) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(leaving, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsNextVoices(this.__wbg_ptr, specs, ptr0, len0, power, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether an obligation binds its debtor: for a collective, once done
   * (F128, N13's public outside withdrawn); null if not one.
   * @param {any} specs
   * @param {string} id
   * @returns {boolean | undefined}
   */
  agreementsObligationBinds(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsObligationBinds(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] === 16777215 ? void 0 : ret[0] !== 0;
  }
  /**
   * The payments a collective received during a broken stretch and owes
   * back, the sale not signed anew after the rollback (rule 37d, RB2):
   * open obligations, each `{ payment, to, unit, value, stillBroken }`.
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  agreementsOwedBack(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsOwedBack(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a collective owes now (F125, D5): its obligations that bind,
   * and those it owes as a fork's successor, neither paid in full by the
   * receipts held nor ended by a creditor's release.
   * @param {any} specs
   * @param {string} collective
   * @returns {string[]}
   */
  agreementsOwes(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsOwes(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * What is paid toward an obligation, as a binding answer: an error
   * coded `agreements/own-attempt` where it rests on this client's own failed
   * attempts to reach homes, shown as unknown (F153).
   * @param {any} specs
   * @param {string} id
   * @returns {bigint}
   */
  agreementsPaid(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPaid(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return BigInt.asUintN(64, ret[0]);
  }
  /**
   * Payer-side splitting (F124 P2): what a paying wallet reading Agreements pays
   * each holder for `amount` on the stake in `object` (hex, or null for
   * the collective itself), or why it cannot. Leftovers by largest
   * remainder; a tied unit is the payer's to decide, at most one per tie
   * (Agreements rule 15a, F165, F168): this wallet gives it to the tied holder
   * with the smallest identity hash, a choice, not a rule.
   * @param {any} specs
   * @param {string} agreement
   * @param {string | null | undefined} object
   * @param {bigint} amount
   * @returns {any}
   */
  agreementsPayerSplit(specs, agreement, object, amount) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(object) ? 0 : passStringToWasm0(object, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPayerSplit(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, amount);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The pointer check (rule 18, F123): whether the payee pointer of
   * `owners` counts for Agreements under `agreement`: "no-split-service",
   * "ordinary", "bypasses" (with the addresses no service's own pointer
   * carries, as hex) or "undetermined".
   * @param {any} specs
   * @param {string} owners
   * @param {string} agreement
   * @returns {any}
   */
  agreementsPointerCheck(specs, owners, agreement) {
    const ptr0 = passStringToWasm0(owners, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPointerCheck(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The payee's pointer acts its own acts hold, for what a payment
   * follows (an obligation, an agreement or an offer; Money rule 14,
   * F145, F157, F163, F168): `{ pointers, complete }`, or null where
   * `fulfils` is none of these.
   * @param {any} specs
   * @param {string} fulfils
   * @param {string} payee
   * @returns {any}
   */
  agreementsPointerHolding(specs, fulfils, payee) {
    const ptr0 = passStringToWasm0(fulfils, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPointerHolding(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The resignations the parties of a collective's agreement published,
   * registered or not (rule 37a; F187, 3): departures `{ act, party,
   * kind, agreement }`. What a client reads beside Agreements' count of the
   * voices that remain, to warn the last voice.
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  agreementsPublishedResignations(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPublishedResignations(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsPurchase(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPurchase(this.__wbg_ptr, specs, ptr0, len0);
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
  agreementsRecord(specs, collective, record2) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(record2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRecord(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
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
  agreementsRelease(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRelease(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A clone read as a rollback's (Agreements rule 37d, F185): as `agreementsAgreement`,
   * its mark checked against the powers a rollback names.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsRollbackAgreement(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRollbackAgreement(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a rollback made next would register (rule 37d, RB3; F187 2),
   * checked from what this verifier holds: `{ error, departures }`, each
   * departure `{ act, party, kind }` ("resigned", "stepped-down",
   * "declared"). A client asks it from a fresh reading of the relays
   * before it sends the rollback's rotation.
   * @param {any} specs
   * @param {string} collective
   * @param {string[]} registers
   * @returns {any}
   */
  agreementsRollbackRegisters(specs, collective, registers) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(registers, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRollbackRegisters(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Who counts for a power (`{ form, area }`) of the agreement in force
   * just before a broken collective's broken act, at a rollback made
   * next (Agreements rules 37d, 44d), `leaving` taken out (the parties whose
   * resignations the rollback registers): as `agreementsNextVoices`; or
   * `{ error }`, why there is no such count.
   * @param {any} specs
   * @param {string} collective
   * @param {any} power
   * @param {string[]} leaving
   * @returns {any}
   */
  agreementsRollbackVoices(specs, collective, power, leaving) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(leaving, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRollbackVoices(this.__wbg_ptr, specs, ptr0, len0, power, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a split service owes (Agreements rule 29): every incoming receipt and
   * payer's claim without its split, and every payout without the
   * receiver's receipt, each naming one receiver and one agreement.
   * @param {any} specs
   * @param {string} service
   * @returns {any}
   */
  agreementsServiceAccount(specs, service) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsServiceAccount(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The declarations of absence naming `party` this verifier holds (RB3,
   * client conformance): `{ act, signer, agreement, clause, outcomes,
   * contests }`, `contests` the party's contests of it (BQ4).
   * The numbers on the splits a service made under a deal (DQ6, F188):
   * `{ numbers: [number, split][], gaps, repeated, unnumbered }`. Client
   * conformance: a holder's client MUST raise the alarm where the
   * numbers it receives skip (`gaps`).
   * @param {any} specs
   * @param {string} service
   * @param {string} agreement
   * @returns {any}
   */
  agreementsSplitNumbers(specs, service, agreement) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsSplitNumbers(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
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
  agreementsSplitTurns(specs, service, agreement, stake, holders, previous) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(holders, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsSplitTurns(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, stake, ptr2, len2, ptr3, len3);
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
  agreementsSplit(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsSplit(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Where a deal stands forked (rule 45b, F186): `{ reference, branches,
   * tangled }`, each branch its versions from the split to its latest,
   * `tangled` the reason where the fork is tangled (F188, DQ1 to DQ4: the
   * deal stays on its reference); null where it is not forked. Throws
   * where the shape is not decided (QH1, refused rather than guessed).
   * The version of an agreement in force, as rule 45b reads a deal's
   * forks (F186, F188, F192): while forked or tangled, the reference.
   * Throws where the shape is not decided (QH1: two settlements, a
   * judge's among them, neither holding the other). What a buyer's
   * client checks an offer against before paying (F188, a strong
   * SHOULD).
   * @param {any} specs
   * @param {string} agreement
   * @returns {string}
   */
  agreementsVersionInForce(specs, agreement) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_agreementsVersionInForce(this.__wbg_ptr, specs, ptr0, len0);
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
   * The routes act (Identity type 3) or encryption-key act (Envelopes type
   * 4) that counts for an identity: its valid acts of that spec and type,
   * followed from version 1 (Identity, "Routes"; Envelopes, "Encryption
   * key"). Returns the act, whether the chain is contested past it, and
   * its payload as CBOR.
   * @param {string} identity
   * @param {string} spec
   * @param {number} type_
   * @returns {any}
   */
  latest(identity2, spec, type_) {
    const ptr0 = passStringToWasm0(identity2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
   * until the freeze). Given the Money and Agreements spec hashes too, it can
   * tell which acts may carry acknowledgements (F110); without them, an
   * act of another specification carrying `acks` is unknown to it. Given
   * the Envelopes and Text spec hashes, which every client holds (MICS,
   * "Client conformance"), it decodes their acts strictly (Envelopes
   * draft 10, rule 30; Text draft 8, rule 14; F295, F296) and shows a text
   * or Envelopes act carrying `acks` as invalid without the Money and
   * Agreements hashes (Fable's E5, the clients' half).
   * @param {string} identity_spec
   * @param {string | null} [money_spec]
   * @param {string | null} [agreements_spec]
   * @param {string | null} [envelopes_spec]
   * @param {string | null} [text_spec]
   */
  constructor(identity_spec, money_spec, agreements_spec, envelopes_spec, text_spec) {
    const ptr0 = passStringToWasm0(identity_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(money_spec) ? 0 : passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(agreements_spec) ? 0 : passStringToWasm0(agreements_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(envelopes_spec) ? 0 : passStringToWasm0(envelopes_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    var ptr4 = isLikeNone(text_spec) ? 0 : passStringToWasm0(text_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len4 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0];
    VerifierFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * Where to look for an act a reference names beside this signer
   * (Envelopes draft 9, rule 20, F272): its outbox routes that count,
   * then the homes in force at its latest position. Hints, each once.
   * @param {string} signer
   * @returns {string[]}
   */
  places(signer) {
    const ptr0 = passStringToWasm0(signer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_places(this.__wbg_ptr, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * The home quorum of a counting rotation (Money rule 15, F180): the
   * receipts the home rule in effect before it requires, each passing
   * the receipt checks, per home operator, and how many operators are
   * needed. `kind` is "own" (it counts on its own signatures: anchor the
   * rotation itself), "homes", or "homeless" (the new homes' receipts,
   * under the new home rule, F182); null where it is not a counting
   * rotation. *The owner's client anchors these after a lock
   * change (Money rule 15, F181).*
   * @param {string} identity
   * @param {string} rotation
   * @returns {any}
   */
  quorum(identity2, rotation) {
    const ptr0 = passStringToWasm0(identity2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
  resolve(identity2) {
    const ptr0 = passStringToWasm0(identity2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_resolve(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The standing of an act held: "valid", "disputed", "void", "pending",
   * "invalid", "unknown", or "scoped" (signed with a key a higher MIR's
   * act installs, a grant key: Agreements judge it, F128).
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
  /**
   * An identity's succession (Identity draft 13, section 8, F300):
   * `{ state, rotation, successor, confirmation }`, `state` one of
   * "none", "declared" (shown as declared, never followed), "confirmed"
   * (followed), "unknown" (a confirmation held whose status cannot be
   * told), "elsewhere" (another protocol's, confirmed as its link cMIP
   * says).
   * @param {string} identity
   * @returns {any}
   */
  succession(identity2) {
    const ptr0 = passStringToWasm0(identity2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_succession(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
};
if (Symbol.dispose) Verifier.prototype[Symbol.dispose] = Verifier.prototype.free;
function actId(bytes2) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
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
function cborDecode(bytes2) {
  const ptr0 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
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
function chainKeyFromSeeds(scheme, seeds) {
  const ptr0 = passArray8ToWasm0(seeds, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.chainKeyFromSeeds(scheme, ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function describeAct(bytes2) {
  const ptr0 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.describeAct(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function encryptionKeyPayload(version, previous, _public) {
  var ptr0 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(_public, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.encryptionKeyPayload(version, ptr0, len0, ptr1, len1);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
}
function keyDeliveryPayload(target, key, media) {
  const ptr0 = passStringToWasm0(target, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.keyDeliveryPayload(ptr0, len0, ptr1, len1, media);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
}
function lockMedia(plaintext) {
  const ptr0 = passArray8ToWasm0(plaintext, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.lockMedia(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function makeChainSignature(input) {
  const ret = wasm.makeChainSignature(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function makeEveryday(input) {
  const ret = wasm.makeEveryday(input);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function makeGenesis(input) {
  const ret = wasm.makeGenesis(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function makeRotation(input) {
  const ret = wasm.makeRotation(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function newEncryptionSecret() {
  const ret = wasm.newEncryptionSecret();
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function newSigningSecret() {
  const ret = wasm.newSigningSecret();
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function newTestChainKey(scheme) {
  const ret = wasm.newTestChainKey(scheme);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function nfc(s) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.nfc(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
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
function openSealed(bytes2, me, secret) {
  const ptr0 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(me) ? 0 : passStringToWasm0(me, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ret = wasm.openSealed(ptr0, len0, ptr1, len1, ptr2, len2);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
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
function pickupTag(_public) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passArray8ToWasm0(_public, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.pickupTag(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
function readKeyDelivery(payload) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readKeyDelivery(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function routesPayload(input) {
  const ret = wasm.routesPayload(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function runningSummary(ids) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.runningSummary(ptr0, len0);
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
function seal(input) {
  const ret = wasm.seal(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function sealedParts(bytes2) {
  const ptr0 = passArray8ToWasm0(bytes2, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.sealedParts(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function signingPublic(secret) {
  const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.signingPublic(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
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
function xwingPublic(secret) {
  const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.xwingPublic(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
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
  } catch (e2) {
    const idx = addToExternrefTable0(e2);
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
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
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
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
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
      } catch (e2) {
        const validResponse = expectedResponseType(module2.type);
        if (validResponse && module2.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e2);
        } else {
          throw e2;
        }
      }
    }
    const bytes2 = await module2.arrayBuffer();
    return await WebAssembly.instantiate(bytes2, imports);
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

// node_modules/@noble/hashes/_u64.js
var fromNumH = (n) => n / 2 ** 32 | 0;
var fromNumL = (n) => n >>> 0;
function setU64FromNum(view, byteOffset, n, isLE) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view.setUint32(byteOffset, isLE ? l : h, isLE);
  view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}

// node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle = (title) => title ? `"${title}" ` : "";
function anumber(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes2 = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes2 ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes2)
    throw new TypeError(message);
  throw new RangeError(message);
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
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title);
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
    const { view, buffer, blockLen } = this;
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
        this.process(view, 0);
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
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      buffer.fill(0);
    }
    setU64FromNum(view, blockLen - 8, this.length * 8, isLE);
    this.process(view, 0);
    this.roundClean();
    const oview = out === buffer ? view : createView(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state = this.get();
    if (len % 4 || outLen > state.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
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
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
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

// ../genesis/src/witness.ts
var WITNESS_EXPLANATION = 'A witness act says "I received this act and rely on it". It keeps the act visible as disputed even if its author later disowns it. It is public: anyone can see that you rely on this act, though not what it says.';

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
  envelopes: sha2562("ENVELOPE, test value until the freeze"),
  text: sha2562("TEXT, test value until the freeze")
};
var MIRS = {
  ...SPECS,
  money: sha2562("FINANCE, test value until the freeze"),
  agreements: sha2562("LAW, test value until the freeze"),
  development: sha2562("PRODUCTION, test value until the freeze")
};
var ACK_SPECS = [MIRS.identity, MIRS.money, MIRS.agreements];
var IDENTITY_TYPES = { genesis: 0, rotation: 1, receipt: 2, routes: 3, witness: 15, chainSignature: 16 };
var ENVELOPES_TYPES = { publication: 0, keyDelivery: 1, encryptionKey: 4 };

// ../reader/src/web/core.ts
await __wbg_init({ module_or_path: new URL("mor_wasm_bg.wasm", document.baseURI) });

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
var sealedId = (bytes2) => {
  const t = unhex(sha2562("MOR/transport/sealed"));
  const all = new Uint8Array(64 + bytes2.length);
  all.set(t, 0);
  all.set(t, 32);
  all.set(bytes2, 64);
  return sha2562(all);
};
var stated = /* @__PURE__ */ new Map();
var Relay = class {
  constructor(base, via2 = base) {
    this.base = base;
    this.via = via2;
  }
  async call(path, init) {
    const r = await fetch(this.via.replace(/\/$/, "") + path, init);
    const body = new Uint8Array(await r.arrayBuffer());
    if (!r.ok) {
      let code = -1;
      let reason = `HTTP ${r.status}`;
      let acts = [];
      try {
        const e2 = cborDecode(body);
        code = e2.get(0);
        reason = e2.get(1) ?? reason;
        acts = bytesList(e2.get(2));
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
  /** The relay's stated limits, read from `GET /info` once; null when it does not say, and then the relay judges what it is sent. */
  limits() {
    let l = stated.get(this.via);
    if (!l) {
      l = this.info().then(
        (m) => {
          const x = m.get(3);
          const act = x?.get(0);
          const media = x?.get(1);
          return typeof act === "number" && typeof media === "number" ? { act, media } : null;
        },
        () => null
      );
      stated.set(this.via, l);
      void l.then((v) => v ?? stated.delete(this.via));
    }
    return l;
  }
  /**
   * cMIP draft 3, "Clients", 6: a client SHOULD NOT send a body larger than
   * the relay's stated limits. Refused here, before anything is sent, with
   * the relay's own code for "too large".
   */
  async fits(size, media) {
    const l = await this.limits();
    if (!l) return;
    const limit = media ? l.media : l.act;
    if (size > limit) throw new RelayError(CODE.tooLarge, `not sent: ${size} bytes is over this relay's stated limit of ${limit}`);
  }
  /** `POST /acts`. The act id in the answer is checked against the act sent. */
  async putAct(act) {
    await this.fits(act.length, false);
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
    await this.fits(sealed.length, false);
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
    } catch (e2) {
      if (e2 instanceof RelayError && e2.code === CODE.notHeld) return null;
      throw e2;
    }
  }
  /** `POST /media`: the relay's answer is checked against the bytes sent. */
  async putMedia(locked) {
    await this.fits(locked.length, true);
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
    } catch (e2) {
      if (e2 instanceof RelayError && e2.code === CODE.notHeld) return null;
      throw e2;
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
var relayAt = (hint, via2 = {}) => new Relay(hint, via2[hint] ?? hint);

// ../genesis/src/lines.ts
var IDENTITY_WORDS = {
  [IDENTITY_TYPES.routes]: "routes: where its acts are found and where to reach it",
  4: "a name",
  5: "a name withdrawn",
  6: "a link claimed",
  7: "a link confirmed",
  8: "a link ended",
  14: "an escape endorsement",
  [IDENTITY_TYPES.witness]: "a witness act: acts of others it relies on"
};
var ENVELOPES_WORDS = {
  [ENVELOPES_TYPES.publication]: "a publication (a post, a picture, a file)",
  [ENVELOPES_TYPES.keyDelivery]: "a key delivery",
  3: "a withdrawal of a publication",
  [ENVELOPES_TYPES.encryptionKey]: "a new encryption key, to receive sealed messages",
  5: "a vow"
};
var MONEY_WORDS = {
  0: "a payee pointer: where it is paid",
  1: "a debt it owes",
  2: "a receipt of a payment",
  3: "a claim of a payment it made",
  4: "a release of a debt owed to it"
};
var AGREEMENTS_WORDS = {
  0: "an agreement proposed",
  1: "its signature on an agreement",
  3: "a work claimed",
  4: "a stake transferred",
  5: "a release",
  6: "a standing offer",
  8: "a split",
  9: "a grant",
  10: "a grant revoked",
  16: "a resignation",
  17: "a record",
  19: "a fork",
  20: "a closing"
};
function whatIs(d, specs = MIRS) {
  if (d.spec === void 0 || d.type === void 0) return "a private act: only those it was meant for can read what it is";
  const words2 = d.spec === specs.identity ? IDENTITY_WORDS[d.type] : d.spec === specs.envelopes ? ENVELOPES_WORDS[d.type] : d.spec === specs.text ? d.type === 0 ? "a text, such as a post or a message" : void 0 : d.spec === specs.money ? MONEY_WORDS[d.type] : d.spec === specs.agreements ? AGREEMENTS_WORDS[d.type] : void 0;
  const w = words2 ?? `an act of type ${d.type} under ${d.spec === specs.identity ? "Identity" : d.spec === specs.envelopes ? "Envelopes" : d.spec === specs.money ? "Money" : d.spec === specs.agreements ? "Agreements" : "another specification"}`;
  return d.public ? w : `${w}, private`;
}
function ownLine(sequence) {
  if (!sequence.length) return { acts: 0, card: null };
  return { acts: sequence.length, card: { act: sequence[sequence.length - 1], position: sequence.length, summary: runningSummary(sequence) } };
}
async function actsBy(signer, hints, via2 = {}) {
  const out = /* @__PURE__ */ new Map();
  for (const hint of hints) {
    try {
      let after;
      for (; ; ) {
        const page = await relayAt(hint, via2).feed({ signer, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          try {
            const d = describeAct(it.item);
            if (!out.has(d.id)) out.set(d.id, it.item);
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return [...out.values()];
}
function linesOf(o) {
  const specs = o.specs ?? MIRS;
  const held = /* @__PURE__ */ new Map();
  for (const a of o.acts) {
    let d;
    try {
      d = describeAct(a);
    } catch {
      continue;
    }
    if (d.signer !== o.identity) continue;
    if (d.spec === specs.identity && (d.type === IDENTITY_TYPES.genesis || d.type === IDENTITY_TYPES.rotation || d.type === IDENTITY_TYPES.chainSignature)) continue;
    held.set(d.id, d);
  }
  const ownPrev = new Map(o.own.map((id, i) => [id, i ? o.own[i - 1] : null]));
  const prevOf = (id) => {
    if (ownPrev.has(id)) return { known: true, prev: ownPrev.get(id) };
    const d = held.get(id);
    if (!d || d.spec === void 0) return { known: false, prev: null };
    return { known: true, prev: d.prev ?? null };
  };
  const named = /* @__PURE__ */ new Set();
  for (const id of [...held.keys(), ...o.own]) {
    const p = prevOf(id);
    if (p.prev) named.add(p.prev);
  }
  const ownTip = o.own[o.own.length - 1];
  const tips = [...held.values()].filter((d) => !named.has(d.id) && d.binding === o.binding).map((d) => d.id);
  if (ownTip && !tips.includes(ownTip) && !named.has(ownTip)) tips.push(ownTip);
  const out = [];
  for (const tip of tips) {
    const d = held.get(tip);
    const latest = d ? whatIs(d, specs) : "an act made on this device";
    const ids = [];
    let at = tip;
    let why;
    while (at) {
      if (ids.includes(at)) {
        why = "its acts name each other in a circle";
        break;
      }
      ids.push(at);
      const p = prevOf(at);
      if (!p.known) {
        why = held.has(at) ? `it holds a private act made elsewhere (${at.slice(0, 12)}\u2026): only the app that made it can read which act comes before it` : `an act in it (${at.slice(0, 12)}\u2026) was not found at its homes or relays`;
        break;
      }
      at = p.prev;
    }
    ids.reverse();
    const position = d?.position ?? (ownPrev.has(tip) ? o.own.indexOf(tip) + 1 : void 0);
    if (!why && position !== void 0 && position !== ids.length) why = `its latest act says position ${position}, but ${ids.length} acts were found behind it`;
    out.push({
      tip,
      own: tip === ownTip,
      readable: !why,
      card: why ? null : { act: tip, position: ids.length, summary: runningSummary(ids) },
      latest,
      ...why ? { why } : {}
    });
  }
  return out.sort((a, b) => Number(b.own) - Number(a.own) || (a.tip < b.tip ? -1 : 1));
}
function lineWords(l) {
  const whose = l.own ? "This device\u2019s line" : "A line made elsewhere";
  if (l.readable && l.card) return `${whose}: ${l.card.position} act${l.card.position === 1 ? "" : "s"}, the latest ${l.card.act} (${l.latest}); summary ${l.card.summary}.`;
  return `${whose} that this device cannot read, ending at ${l.tip} (${l.latest}): ${l.why}. Give its card (its latest act, position and summary, as the app that made it shows them) to keep it.`;
}
function voidWarning(left) {
  return `${left.length === 1 ? "One line of acts is" : `${left.length} lines of acts are`} left out of this rotation: ${left.map((l) => l.tip).join(", ")}. Every act of ${left.length === 1 ? "that line" : "those lines"}, signed with the key this rotation replaces, becomes void, unless someone relied on it in a way the protocol can see (Identity rules 34 and 35). Leave ${left.length === 1 ? "it" : "them"} out only if you did not make ${left.length === 1 ? "it" : "them"}, or no longer want ${left.length === 1 ? "it" : "them"} to count.`;
}
function planLines(lines2, o = {}) {
  const leaveOut = new Set(o.leaveOut ?? []);
  const cards = o.cards ?? [];
  for (const t of leaveOut) if (!lines2.some((l) => l.tip === t)) throw new Error(`no line found ends at ${t}: nothing to leave out`);
  for (const c of cards) {
    if (!Number.isSafeInteger(c.position) || c.position < 1 || !/^[0-9a-f]{64}$/.test(c.act) || !/^[0-9a-f]{64}$/.test(c.summary)) {
      throw new Error("a card is a latest act and a summary (64 hexadecimal characters each) and a position from 1");
    }
    const l = lines2.find((x) => x.tip === c.act);
    if (l?.card && (l.card.position !== c.position || l.card.summary !== c.summary)) {
      throw new Error(`the card for ${c.act} does not match its line as read here (position ${l.card.position}, summary ${l.card.summary})`);
    }
    if (leaveOut.has(c.act)) throw new Error(`${c.act} is both given a card and left out`);
  }
  const kept = [];
  const left = [];
  const shown2 = [];
  for (const l of lines2) {
    const card = cards.find((c) => c.act === l.tip) ?? l.card;
    if (leaveOut.has(l.tip)) {
      left.push(l);
      shown2.push({ text: `${lineWords(l)} Left out by name: its acts become void.`, tone: "bad" });
    } else if (card) {
      kept.push(card);
      shown2.push({ text: l.readable ? `${lineWords(l)} Kept.` : `${lineWords(l)} Kept by the card given: position ${card.position}, summary ${card.summary}.`, tone: l.readable ? "ok" : "warn" });
    } else {
      left.push(l);
      shown2.push({ text: `${lineWords(l)} No card was given, so it is left out: its acts become void.`, tone: "bad" });
    }
  }
  for (const c of cards) {
    if (lines2.some((l) => l.tip === c.act)) continue;
    kept.push(c);
    shown2.push({ text: `A line ending at ${c.act}, not found at the identity's homes or relays: kept by the card given (position ${c.position}, summary ${c.summary}).`, tone: "warn" });
  }
  return { kept, left, shown: shown2, warning: left.length ? voidWarning(left) : null };
}
function checkWarned(plan, warned) {
  if (plan.warning && warned !== plan.warning) {
    throw new Error(`Nothing was signed. ${plan.warning} Show this to the owner and pass it back to leave ${plan.left.length === 1 ? "it" : "them"} out, or give a card for each line to keep.`);
  }
}

// src/web/node-fs.ts
var none = (name) => () => {
  throw new Error(`${name}: there are no files in a browser`);
};
var readFileSync = none("readFileSync");
var writeFileSync = none("writeFileSync");
var renameSync = none("renameSync");

// src/web/node-crypto.ts
function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}
function createHash(algorithm) {
  if (algorithm !== "sha256") throw new Error(`${algorithm}: only sha256 in the browser`);
  const parts = [];
  const h = {
    update(data) {
      parts.push(typeof data === "string" ? new TextEncoder().encode(data) : data);
      return h;
    },
    digest() {
      const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
      let at = 0;
      for (const p of parts) {
        all.set(p, at);
        at += p.length;
      }
      return sha256(all);
    }
  };
  return h;
}

// ../genesis/src/kex.ts
var kexLog = { recording: false, entries: [] };
function record(e2) {
  if (kexLog.recording) kexLog.entries.push(e2);
}

// ../genesis/src/lookup.ts
var inBrowser = () => typeof globalThis.window !== "undefined" && typeof globalThis.process === "undefined";
function cannotReach(hint, via2 = {}) {
  if (via2[hint]) return null;
  let host;
  try {
    host = new URL(hint).hostname;
  } catch {
    return "not an address";
  }
  if (host.endsWith(".onion")) {
    return inBrowser() ? "an onion address, which a web browser cannot reach: it is reached only through Tor" : "an onion address, reached only through Tor, and this client has no way in to it";
  }
  return null;
}
async function firstOf(items, ask2, failed) {
  if (!items.length) return null;
  return new Promise((resolve) => {
    let left = items.length;
    let done = false;
    for (const x of items) {
      ask2(x).then(
        (r) => {
          left--;
          if (r !== null && r !== void 0 && !done) {
            done = true;
            resolve(r);
          } else if (!left && !done) resolve(null);
        },
        () => {
          failed?.(x);
          left--;
          if (!left && !done) resolve(null);
        }
      );
    }
  });
}
async function lookUp(identity2, hints, via2 = {}, into) {
  const v = into ?? new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const asked = /* @__PURE__ */ new Set();
  const unreachable = [];
  const notTried = [];
  const operatorActs = /* @__PURE__ */ new Map();
  const heldBytes = /* @__PURE__ */ new Map();
  const keep2 = (acts) => {
    for (const a of acts) {
      try {
        heldBytes.set(actId(a), a);
        v.add(a);
      } catch {
      }
    }
  };
  const tryable = (hint) => {
    const why = cannotReach(hint, via2);
    if (!why) return true;
    if (!notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return false;
  };
  const failed = (hint) => {
    if (!unreachable.includes(hint)) unreachable.push(hint);
  };
  const genesis = await firstOf(hints.filter(tryable), (h) => relayAt(h, via2).getAct(identity2), failed);
  if (!genesis) throw new Error(`the genesis of ${identity2} was not found at ${hints.join(", ")}`);
  keep2([genesis]);
  const genesisHomes = () => {
    try {
      const d = describeAct(genesis);
      if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.genesis || !d.payload) return [];
      const p = cborDecode(d.payload);
      return (p.get(2) ?? []).map(([op, hint]) => ({ operator: op ? hex(op) : null, hint }));
    } catch {
      return [];
    }
  };
  const inForce = () => {
    const r2 = v.resolve(identity2);
    return r2.homesAt?.length ? r2.homesAt[r2.homesAt.length - 1] : genesisHomes();
  };
  const record2 = async (h) => {
    const rec = await relayAt(h.hint, via2).identity(identity2);
    keep2([...rec.chain, ...rec.receipts, ...rec.routes, ...rec.encryptionKeys, ...rec.evidence, ...rec.otherReceipts]);
    for (const a of rec.links) {
      try {
        const d = describeAct(a);
        if (!d.public && d.signer === identity2) v.foundAtHome(d.id, h.operator ?? identity2);
      } catch {
      }
    }
  };
  const answered = () => [...asked].filter((h) => !unreachable.includes(h) && !notTried.some((n) => n.hint === h));
  const operatorChain = async (op, own) => {
    const from = async (hint) => {
      const r2 = relayAt(hint, via2);
      const [g, page] = await Promise.all([r2.getAct(op), r2.feed({ signer: op })]);
      if (!g) return null;
      const chain = page.items.filter((i) => i.kind === "act").map((i) => i.item).filter((a) => {
        try {
          const d = describeAct(a);
          return d.spec === SPECS.identity && d.type === IDENTITY_TYPES.rotation;
        } catch {
          return false;
        }
      });
      return [g, ...chain];
    };
    const ownAnswered = own.filter((h) => answered().includes(h));
    const got = await firstOf(ownAnswered, from) ?? await firstOf(answered().filter((h) => !own.includes(h)), from);
    if (!got) return;
    keep2(got);
    operatorActs.set(op, got);
  };
  for (let round = 0; round < 8; round++) {
    const homes = inForce();
    const fresh = homes.filter((h) => !asked.has(h.hint));
    if (!fresh.length) break;
    for (const h of fresh) asked.add(h.hint);
    await Promise.all(fresh.filter((h) => tryable(h.hint)).map((h) => record2(h).catch(() => failed(h.hint))));
    const ops = [...new Set(homes.map((h) => h.operator).filter((o) => !!o && o !== identity2 && !operatorActs.has(o)))];
    await Promise.all(ops.map((op) => operatorChain(op, homes.filter((h) => h.operator === op).map((h) => h.hint))));
  }
  const resolution = v.resolve(identity2);
  const r = v.latest(identity2, SPECS.identity, IDENTITY_TYPES.routes);
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
  const e2 = v.latest(identity2, SPECS.envelopes, ENVELOPES_TYPES.encryptionKey);
  let encryptionKey = null;
  if (e2.payload) {
    const p = cborDecode(e2.payload);
    const [scheme, key] = p.get(2);
    if (scheme === 4) encryptionKey = key;
  }
  const receipts = [];
  for (const [id, a] of heldBytes) {
    const d = describeAct(a);
    if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.receipt || !d.payload) continue;
    const p = cborDecode(d.payload);
    if (hex(p.get(0)) === identity2 && v.status(id) === "valid") receipts.push(a);
  }
  return {
    resolution,
    verifier: v,
    receipts,
    operatorChains: [...operatorActs.values()].flat(),
    unreachable,
    notTried,
    routes: { act: r.act ?? null, contested: r.contested, routes },
    encryptionKeyAct: e2.act ?? null,
    encryptionKey,
    inbox(spec) {
      const inboxes = routes.filter((x) => x.kind === 1);
      const hit = inboxes.find((x) => x.scope === spec) ?? inboxes.find((x) => x.scope === null);
      return hit ? hit.hints : null;
    }
  };
}
var refAct = (r) => typeof r === "string" ? r : r[0];
var refSigner = (r) => typeof r === "string" ? null : r[1];
function referenceTo(act) {
  const d = describeAct(act);
  return d.public ? [d.id, d.signer ?? d.id] : d.id;
}
async function followRef(r, hints, via2 = {}) {
  const id = refAct(r);
  const named = refSigner(r);
  const notTried = [];
  const check = (act) => {
    const d = describeAct(act);
    if (d.id !== id) throw new Error(`the act fetched is ${d.id}, not ${id}`);
    const actual = d.signer ?? d.id;
    if (named && actual !== named) throw new Error(`the reference names ${named} as the signer of ${id}, but the act shows ${actual}: the reference is wrong`);
    return act;
  };
  const tryable = (hint) => {
    const why = cannotReach(hint, via2);
    if (why && !notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return !why;
  };
  const fetchFrom = async (places2) => {
    let at = "";
    const act = await firstOf(places2.filter(tryable), async (h) => {
      const a = await relayAt(h, via2).getAct(id);
      if (a && !at) at = h;
      return a;
    });
    return act ? { act: check(act), at } : null;
  };
  const here = await fetchFrom(hints);
  if (here) return { ...here, how: "asked", notTried };
  if (!named) throw new Error(`the act ${id} was not found at ${hints.join(", ")}, and the reference names no signer to look by`);
  let l;
  try {
    l = await lookUp(named, hints, via2);
  } catch (e2) {
    throw new Error(`the act ${id} was not found at ${hints.join(", ")}, and its signer ${named} could not be looked up there: ${e2 instanceof Error ? e2.message : e2}`);
  }
  for (const n of l.notTried) if (!notTried.some((x) => x.hint === n.hint)) notTried.push(n);
  const places = l.verifier.places(named).filter((p) => !hints.includes(p));
  const outbox = new Set(l.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints.map((h) => h.replace(/\/$/, ""))));
  const there = await fetchFrom(places.filter((p) => outbox.has(p))) ?? await fetchFrom(places.filter((p) => !outbox.has(p)));
  if (there) return { ...there, how: "signer", notTried };
  throw new Error(`the act ${id} was not found at ${hints.join(", ")}, nor at its signer's routes and homes (${places.join(", ") || "none found"})`);
}
async function holdSequence(v, signer, l, places, via2 = {}) {
  if (l.resolution.links.length < 2) return;
  const homes = (l.resolution.homes ?? []).map((h) => h.hint);
  const hints = [.../* @__PURE__ */ new Set([...homes, ...places])].filter((h) => !cannotReach(h, via2));
  for (const a of await actsBy(signer, hints, via2)) {
    try {
      v.add(a);
    } catch {
    }
  }
}

// ../genesis/src/identity.ts
var TEST_LABEL = "MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.";
var CLOCK_KIND = 1;
var NO_CLOCK_WARNING = "This identity declares no clock. If its signing key is ever stolen, what the thief does with it until you change your keys, and every payment made to what the thief published, will be your loss, whatever you anchor: payers are compared with your key change only on a clock you named in advance (Money rule 15).";
var sameRef = (a, b) => a.cmip === b.cmip && a.params === b.params;
function clockDeclaration(c) {
  if (!c) return { spec: MIRS.money, kind: CLOCK_KIND };
  const ref = (r) => [unhex(r.cmip), cborDecode(unhex(r.params))];
  return { spec: MIRS.money, kind: CLOCK_KIND, cbor: cborEncode([ref(c.main), ...c.backup ? [ref(c.backup)] : []]) };
}
var AGREEMENTS_RECORD = 17;
var b64 = (b) => base64(b);
var unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var TestIdentity = class _TestIdentity {
  constructor(f, via2 = {}) {
    this.f = f;
    this.via = via2;
  }
  get id() {
    return this.f.identity;
  }
  // ------------------------------------------------------------ files
  static load(path, via2 = {}) {
    const f = JSON.parse(readFileSync(path, "utf8"));
    if (f.label !== TEST_LABEL) throw new Error(`${path} is not a MOR test identity file`);
    return new _TestIdentity(f, via2);
  }
  /** Written whole to a temporary file, then renamed, readable by its owner only. */
  save(path) {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.f, null, 2) + "\n", { mode: 384 });
    renameSync(tmp, path);
  }
  // ------------------------------------------------------------ genesis
  /**
   * A new test identity: an signing key, a chain key held in
   * software and committed by hash, and a genesis naming its homes. Nothing
   * is sent yet: save the file first, then `publishGenesis`.
   */
  static create(opts) {
    if (!opts.homes.length) throw new Error("a genesis declares at least one home");
    const signingSecret = newSigningSecret();
    const chainKey = opts.chainKey ?? newTestChainKey(opts.scheme ?? 2);
    const genesis = makeGenesis({
      identitySpec: SPECS.identity,
      signingSecret,
      chainKeyScheme: chainKey.scheme,
      chainKeyCommit: chainKey.commit,
      homes: opts.homes,
      rule: opts.rule,
      declarations: opts.clock ? [clockDeclaration(opts.clock)] : void 0
    });
    const id = actId(genesis);
    return new _TestIdentity(
      {
        label: TEST_LABEL,
        identity: id,
        position: 0,
        binding: id,
        signingSecret: hex(signingSecret),
        safety: { scheme: chainKey.scheme, seeds: hex(chainKey.seeds) },
        chain: [b64(genesis)],
        homes: opts.homes,
        rule: opts.rule ?? null,
        clock: opts.clock ?? null,
        sequence: [],
        routes: null,
        encryption: [],
        pending: null
      },
      opts.via ?? {}
    );
  }
  chainActs() {
    return this.f.chain.map(unb64);
  }
  relay(hint) {
    return relayAt(hint, this.via);
  }
  /**
   * Send an identity-chain act to each home. A home that lacks the earlier
   * chain acts (error 3: a home newly named) gets them first, oldest first.
   */
  async submitChainAct(act, homes) {
    const out = [];
    for (const h of homes) {
      const r = this.relay(h.hint);
      try {
        out.push({ home: h.hint, result: await r.putAct(act) });
      } catch (e2) {
        if (e2 instanceof RelayError && e2.code === CODE.missingPredecessor) {
          try {
            for (const earlier of this.chainActs()) {
              if (actId(earlier) !== actId(act)) await r.putAct(earlier);
            }
            out.push({ home: h.hint, result: await r.putAct(act) });
            continue;
          } catch (e22) {
            out.push(failure(h.hint, e22));
            continue;
          }
        }
        out.push(failure(h.hint, e2));
      }
    }
    return out;
  }
  /** Send the genesis to every home it names; each signs a receipt. */
  async publishGenesis() {
    return this.submitChainAct(this.chainActs()[0], this.f.homes);
  }
  // ------------------------------------------------------------ everyday acts
  everyday(spec, type, payload, opts) {
    if (opts.acks?.length && !ACK_SPECS.includes(spec)) {
      throw new Error("only Identity, Money and Agreements acts may acknowledge (Envelopes rule 4a, F110): to rely on this act, sign a witness act");
    }
    const isRecord = spec === MIRS.agreements && type === AGREEMENTS_RECORD;
    let objects = opts.objects;
    if (this.f.cites && spec !== SPECS.identity && !isRecord && !objects?.some((o) => o[0] === this.f.identity)) {
      objects = [...objects ?? [], ...this.f.cites.map((d) => [this.f.identity, d])];
    }
    const made = makeEveryday({
      signingSecret: unhex(this.f.signingSecret),
      signer: this.f.identity,
      binding: this.f.binding,
      spec,
      type,
      payload,
      sequence: this.f.sequence,
      public: opts.public,
      to: opts.to,
      objects,
      refs: opts.refs,
      acks: opts.acks
    });
    this.f.sequence.push(made.id);
    if (this.f.cites && isRecord) this.f.cites = [made.id];
    return made;
  }
  /** Send an everyday identity act to every home: its standing depends on it (Envelopes, "How acts reach people"). */
  async toHomes(act) {
    const out = [];
    for (const h of this.f.homes) {
      try {
        out.push({ home: h.hint, result: await this.relay(h.hint).putAct(act) });
      } catch (e2) {
        out.push(failure(h.hint, e2));
      }
    }
    return out;
  }
  /**
   * Publish a new version of the routes (Identity type 3): where this
   * identity's content is found (outbox) and where others deliver to it
   * (inbox). Save the file after, since the sequence moved.
   */
  async publishRoutes(routes) {
    const version = (this.f.routes?.version ?? 0) + 1;
    const payload = routesPayload({ version, previous: this.f.routes?.act, routes });
    const made = this.everyday(SPECS.identity, IDENTITY_TYPES.routes, payload, { public: true });
    this.f.routes = { version, act: made.id };
    return { id: made.id, sent: await this.toHomes(made.act) };
  }
  /**
   * Sign a witness act (Identity type 15, F110): "I received this act and
   * rely on it", for each act named. It keeps them visible as disputed if
   * their author later disowns them. Client conformance (Identity rule 18c):
   * never a side effect; the caller passes back the explanation it showed
   * the owner, `WITNESS_EXPLANATION`, word for word, or nothing is signed.
   * Sent to every home and to the relays given, as a public Identity act.
   */
  async witness(acts, opts) {
    if (opts.shown !== WITNESS_EXPLANATION) {
      throw new Error("a witness act is signed only after the owner was shown what it does (Identity rule 18c)");
    }
    if (!acts.length) throw new Error("a witness act names at least one act");
    if (acts.some((a) => this.f.sequence.includes(a))) throw new Error("a witness act names other identities' acts, not this one's");
    const made = this.everyday(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(/* @__PURE__ */ new Map()), { public: true, acks: acts });
    const sent = await this.toHomes(made.act);
    for (const hint of opts.relays ?? []) await relayAt(hint, this.via).putAct(made.act);
    return { id: made.id, act: made.act, sent };
  }
  /**
   * Publish a new encryption key (Envelopes type 4): a fresh X-Wing key
   * pair; the public half in the act, the private half kept in the file.
   */
  async publishEncryptionKey() {
    const last = this.f.encryption.at(-1);
    const version = (last?.version ?? 0) + 1;
    const secret = newEncryptionSecret();
    const payload = encryptionKeyPayload(version, last?.act, xwingPublic(secret));
    const made = this.everyday(SPECS.envelopes, ENVELOPES_TYPES.encryptionKey, payload, { public: true });
    this.f.encryption.push({ version, act: made.id, secret: hex(secret) });
    return { id: made.id, sent: await this.toHomes(made.act) };
  }
  // ------------------------------------------------------------ rotation
  /**
   * Every line of this identity's everyday acts that a rotation would judge
   * (Identity rule 35, was 17; `lines.ts`): read from its homes, the
   * relays its routes name, and `hints`, each followed back by `prev` to
   * its first act; this device's own line among them.
   */
  async lines(o = {}) {
    const homes = this.f.homes.map((h) => h.hint);
    let routed = [];
    try {
      routed = (await lookUp(this.f.identity, homes, this.via)).routes.routes.flatMap((r) => r.hints);
    } catch {
    }
    const at = [.../* @__PURE__ */ new Set([...homes, ...routed, ...o.hints ?? []])];
    return linesOf({ identity: this.f.identity, binding: this.f.binding, own: this.f.sequence, acts: await actsBy(this.f.identity, at, this.via), specs: o.specs });
  }
  /**
   * What a rotation would keep (Identity rule 35, client conformance): the
   * lines read now, every one kept unless named in `leaveOut` (by its
   * latest act); a line this device cannot read kept by its card in
   * `cards`, or, given none, left out. Show `plan.shown` to the owner, and
   * `plan.warning` where it is not null, before signing.
   */
  async planRotation(o = {}) {
    const lines2 = await this.lines(o);
    return { lines: lines2, plan: planLines(lines2, o) };
  }
  /**
   * Prepare a rotation: a new signing key, a new committed chain key, and
   * every line of this identity's acts kept (`planRotation`): its own, the
   * other apps' and devices', read from its homes and relays, and those it
   * cannot read by the cards given. A line left out, by name or for want of
   * a card, is left out only where `warned` is, word for word, the warning
   * shown (`plan.warning`): otherwise nothing is signed. Optionally new
   * homes or rule (`rule: []` returns to the default). Signed with the
   * chain key the current chain act committed. The rotation is stored as
   * pending; save the file before submitting, so that a retry sends the
   * same bytes.
   */
  async prepareRotation(opts = {}) {
    if (this.f.pending) throw new Error("a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)");
    const { plan } = await this.planRotation(opts);
    checkWarned(plan, opts.warned);
    if (this.f.pending) throw new Error("a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)");
    const newSigning = newSigningSecret();
    const next = newTestChainKey(opts.scheme ?? this.f.safety.scheme);
    const kept = plan.kept;
    const chain = this.chainActs();
    const previous = actId(chain[chain.length - 1]);
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous,
      position: chain.length,
      chainKeyScheme: this.f.safety.scheme,
      chainKeySeeds: unhex(this.f.safety.seeds),
      newSigningPublic: signingPublic(newSigning),
      nextChainKeyScheme: next.scheme,
      nextChainKeyCommit: next.commit,
      kept,
      homes: opts.homes,
      rule: opts.rule,
      declarations: opts.clock !== void 0 ? [clockDeclaration(opts.clock)] : void 0
    });
    const id = actId(rotation);
    this.f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: hex(newSigning),
      safety: { scheme: next.scheme, seeds: hex(next.seeds) },
      homes: opts.homes ?? this.f.homes,
      rule: opts.rule === void 0 ? this.f.rule : opts.rule.length ? opts.rule : null,
      clock: opts.clock
    };
    return id;
  }
  /**
   * What to say plainly before a genesis or a rotation, where it leaves the
   * identity with no clock (Money rule 14b, F181): `NO_CLOCK_WARNING`, or
   * null. `clock` is what the act would declare (undefined: unchanged).
   */
  clockWarning(clock) {
    const after = clock === void 0 ? this.f.clock : clock;
    return after ? null : NO_CLOCK_WARNING;
  }
  /**
   * Submit the pending rotation, the exact same bytes, to the homes whose
   * receipts count (the current set) and to any new homes it names.
   */
  async submitRotation() {
    const p = this.f.pending;
    if (!p) throw new Error("no rotation pending");
    const homes = [...this.f.homes];
    for (const h of p.homes) if (!homes.some((x) => x.hint === h.hint)) homes.push(h);
    return this.submitChainAct(unb64(p.rotation), homes);
  }
  /**
   * Look the identity up as any reader would, and if the pending rotation
   * now counts, take on its keys. Returns whether it counts.
   */
  async settleRotation(anchoring = []) {
    const p = this.f.pending;
    if (!p) throw new Error("no rotation pending");
    const lookup = await lookUp(this.f.identity, [...this.f.homes, ...p.homes].map((h) => h.hint), this.via);
    const links = lookup.resolution.links;
    const counts = links.some((l) => l.act === p.id);
    const before = this.f.clock ?? null;
    let anchored = [];
    let unanchored;
    if (counts) {
      this.f.chain.push(p.rotation);
      this.f.position = this.f.chain.length - 1;
      this.f.binding = p.id;
      this.f.signingSecret = p.signingSecret;
      this.f.safety = p.safety;
      this.f.homes = p.homes;
      this.f.rule = p.rule;
      if (p.clock !== void 0) this.f.clock = p.clock;
      this.f.pending = null;
      if (this.f.cites) this.f.cites = [p.id];
      await this.spread(lookup);
      try {
        anchored = await this.anchorQuorum(lookup, p.id, before, anchoring);
        this.f.anchored = [...this.f.anchored ?? [], ...anchored.map((a) => ({ act: a.act, on: a.on, proof: b64(a.proof) }))];
      } catch (e2) {
        unanchored = e2.message;
      }
    }
    return { counts, lookup, anchored, unanchored };
  }
  /**
   * Anchor a counting rotation's home quorum on `clock` (Money rule 15,
   * F180, F181): every receipt the core library names as supporting it
   * under the home rule before it (for a homeless rotation, the new homes'
   * receipts under the new rule, F182; for a self-hosted identity, the
   * rotation itself), on the main reference, or, where no anchoring for it is given
   * or it fails, on the backup. Nothing where no clock was declared: there
   * is nothing to compare on, and the owner bears (said by `clockWarning`).
   */
  async anchorQuorum(lookup, rotation, clock, anchoring) {
    if (!clock) return [];
    const q = lookup.verifier.quorum(this.f.identity, rotation);
    if (!q) return [];
    const acts = q.supports.flat();
    const tryOn = async (ref, on) => {
      const a = ref && anchoring.find((x) => sameRef(x.reference, ref));
      if (!a) return null;
      try {
        const out = [];
        for (const act of acts) out.push({ act, on, proof: await a.anchor(act) });
        return out;
      } catch {
        return null;
      }
    };
    const done = await tryOn(clock.main, "main") ?? await tryOn(clock.backup, "backup");
    if (!done) throw new Error("the rotation counts, but its home quorum could not be anchored on the declared clock: anchor it before relying on it (Money rule 15)");
    return done;
  }
  /**
   * A chain signature (Identity type 16, F132): `signs` signed with the
   * chain key the latest identity-chain act committed, on the identity
   * chain, committing a new one; the signing key, homes and rules stay.
   * Agreements take a member's signature on a fork or closing only in this form.
   * The chain key is spent once signed, so the act is kept in the chain
   * file at once and sent to every home, as a rotation is (the same bytes
   * whenever resent, rule 8a); it counts once the homes hold it. Sent to
   * `relays` too, beside the act it signs.
   */
  async chainSign(signs, relays = [], shared) {
    if (this.f.pending) throw new Error("a rotation is pending: submit and settle it first; one chain key signs one identity-chain act (Identity rule 8a)");
    const fresh = shared ? null : newTestChainKey(this.f.safety.scheme);
    const next = shared ? shared.next : fresh;
    const chain = this.chainActs();
    const act = makeChainSignature({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous: actId(chain[chain.length - 1]),
      position: chain.length,
      chainKeyScheme: shared ? shared.scheme : this.f.safety.scheme,
      chainKeySeeds: shared ? shared.seeds : unhex(this.f.safety.seeds),
      nextChainKeyScheme: next.scheme,
      nextChainKeyCommit: next.commit,
      signs
    });
    const id = actId(act);
    this.f.chain.push(b64(act));
    this.f.safety = { scheme: next.scheme, seeds: fresh ? hex(fresh.seeds) : "" };
    const sent = await this.submitChainAct(act, this.f.homes);
    for (const hint of relays) await relayAt(hint, this.via).putAct(act);
    const lookup = await lookUp(this.f.identity, this.f.homes.map((h) => h.hint), this.via);
    const counts = lookup.resolution.links.some((l) => l.act === id);
    if (counts) await this.spread(lookup);
    return { id, counts, sent };
  }
  /**
   * Bring every home up to date, as the owner's client should: the chain
   * acts a home missed while it was away (the exact same bytes), and the
   * receipts the other homes signed (cMIP, identity record part 8), so a
   * reader who reaches a single home can still count the majority.
   */
  async spread(lookup) {
    const l = lookup ?? await lookUp(this.f.identity, this.f.homes.map((h) => h.hint), this.via);
    const extra = [...l.operatorChains, ...l.receipts];
    for (const h of this.f.homes) {
      const r = this.relay(h.hint);
      try {
        for (const a of this.chainActs()) await r.putAct(a);
        for (const rc of extra) {
          try {
            await r.putAct(rc);
          } catch {
          }
        }
      } catch (e2) {
        if (!(e2 instanceof TypeError) && !(e2 instanceof RelayError)) throw e2;
      }
    }
  }
  /**
   * Make a grant key (Agreements, F128): a fresh signing key, its secret kept in
   * this identity's file under the grant once known; its public part, as
   * Identity's `[scheme, key]`, goes into the grant (field 9).
   */
  makeGrantKey() {
    const secret = newSigningSecret();
    return { secret, public: [1, signingPublic(secret)] };
  }
  /** Keep a grant key's secret, under the grant that names it (F128). */
  keepGrantKey(grant, collective, secret) {
    this.f.grantKeys = [...(this.f.grantKeys ?? []).filter((k) => k.grant !== grant), { grant, collective, secret: hex(secret) }];
  }
  /** The public half of the chain key held for the next rotation. */
  nextChainKey() {
    const s = chainKeyFromSeeds(this.f.safety.scheme, unhex(this.f.safety.seeds));
    return { scheme: s.scheme, commit: s.commit };
  }
  // ------------------------------------------------------------ keys
  /**
   * Deliver a content key to another identity (Envelopes, "Key delivery"):
   * look up its current encryption key and inbox, make a private key
   * delivery addressed to it, seal it with X-Wing, and put it in its inbox.
   */
  async deliverKey(opts) {
    const them = await lookUp(opts.to, opts.hints, this.via);
    const pk = them.encryptionKey;
    if (!pk) throw new Error("that identity has published no encryption key that counts");
    const inbox = them.inbox(SPECS.envelopes);
    if (!inbox) throw new Error("that identity declares no inbox");
    const payload = keyDeliveryPayload(opts.target, opts.key, opts.media ?? false);
    const made = this.everyday(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, {
      public: false,
      to: [opts.to]
    });
    const sealed = sealFor(made.act, made.key, [{ id: opts.to, key: pk }]);
    const id = sealedId(sealed);
    for (const hint of inbox) await relayAt(hint, this.via).putSealed(sealed);
    return { delivery: made.id, sealed: id, inbox };
  }
  /** A fresh bare key for one expected delivery (cMIP: a fresh bare key per delivery). */
  static newBareKey() {
    const secret = newEncryptionSecret();
    const pub = xwingPublic(secret);
    return { secret, public: pub, pickup: pickupTag(pub) };
  }
  /** Deliver a content key to a bare key someone supplied, found by its pickup tag. */
  async deliverKeyToBare(opts) {
    const payload = keyDeliveryPayload(opts.target, opts.key, opts.media ?? false);
    const made = this.everyday(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, { public: false });
    const sealed = sealFor(made.act, made.key, [{ key: opts.bareKey }]);
    for (const hint of opts.relays) await relayAt(hint, this.via).putSealed(sealed, [pickupTag(opts.bareKey)]);
    return { delivery: made.id, sealed: sealedId(sealed) };
  }
  /**
   * Sign an everyday act, next in this identity's sequence, without sending
   * it: for a signer that hands the act to someone else to submit. Save the
   * file before handing the act out, so the next act follows it.
   */
  sign(spec, type, payload, opts) {
    return this.everyday(spec, type, payload, opts);
  }
  /**
   * Publish an act on this identity's own relays, for example a private
   * post whose key it will deliver. Returns the act id and its content key.
   */
  async publish(spec, type, payload, opts) {
    const made = this.everyday(spec, type, payload, {
      public: opts.public,
      to: opts.to,
      objects: opts.objects,
      refs: opts.refs,
      acks: opts.acks
    });
    for (const hint of opts.relays) await relayAt(hint, this.via).putAct(made.act);
    return made;
  }
  /**
   * Acts its homes hold signed by this identity that this file did not make
   * (F152): each a warning for the owner. A home takes an act of an
   * identity it serves only signed with the key its binding set, and serves
   * the identity's private acts too, sealed, as opaque acts by their signer;
   * so a private link that a thief confirmed with a stolen signing key
   * counts only once it is published there, where this shows it. The owner
   * cannot read it, only see that it exists: if they did not make it
   * elsewhere, the signing key may be stolen, and a rotation ends its use.
   * Homes that do not answer are skipped: silence proves nothing.
   */
  async unrecognised() {
    const known = /* @__PURE__ */ new Set([...this.f.sequence, ...this.chainActs().map((a) => actId(a))]);
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const h of this.f.homes) {
      try {
        let after;
        for (; ; ) {
          const page = await this.relay(h.hint).feed({ signer: this.f.identity, after });
          for (const it of page.items) {
            if (it.kind !== "act") continue;
            const d = describeAct(it.item);
            if (d.signer !== this.f.identity || known.has(d.id) || seen.has(d.id)) continue;
            seen.add(d.id);
            out.push({ id: d.id, home: h.hint, private: !d.public });
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
      }
    }
    return out;
  }
  /**
   * Read this identity's inbox: every sealed container addressed to it, opened
   * with its encryption keys (newest first), the sender looked up and its act
   * judged by the core library.
   */
  async readInbox(opts) {
    const out = [];
    const secrets = [...this.f.encryption].reverse().map((e2) => unhex(e2.secret));
    for (const hint of opts.inbox) {
      const page = await relayAt(hint, this.via).feed({ to: this.f.identity });
      for (const it of page.items) {
        if (it.kind !== "sealed") continue;
        out.push(await receive(it.item, this.f.identity, secrets, opts.senderHints, this.via));
      }
    }
    return out;
  }
};
async function receive(sealed, me, secrets, senderHints, via2 = {}) {
  const id = sealedId(sealed);
  let parts;
  try {
    parts = sealedParts(sealed);
  } catch (e2) {
    return { sealed: id, opened: false, error: String(e2) };
  }
  const index = me === null ? 0 : parts.to.indexOf(me);
  if (index < 0) return { sealed: id, opened: false, error: "not addressed to this identity" };
  let lastError = "no key";
  for (const secret of secrets) {
    record({ kind: "decapsulate", secret, ct: parts.capsules[index] });
    let o;
    try {
      o = openSealed(sealed, me ?? void 0, secret);
    } catch (e2) {
      lastError = String(e2);
      continue;
    }
    const d = o.described;
    const r = { sealed: id, opened: true, from: d.signer, act: d.id, type: d.type, spec: d.spec };
    if (d.spec === SPECS.envelopes && d.type === ENVELOPES_TYPES.keyDelivery && d.payload) {
      r.delivery = readKeyDelivery(d.payload);
    }
    if (d.spec === SPECS.text && d.type === 0 && d.payload) {
      const t = cborDecode(d.payload).get(0);
      if (typeof t === "string") r.text = t;
    }
    if (d.signer) {
      try {
        const them = await lookUp(d.signer, senderHints, via2);
        if (o.key) them.verifier.addWithKey(o.act, o.key);
        else them.verifier.add(o.act);
        r.status = them.verifier.status(d.id);
      } catch (e2) {
        r.status = `sender not found: ${e2}`;
      }
    }
    return r;
  }
  return { sealed: id, opened: false, error: lastError };
}
function sealFor(act, key, recipients) {
  const eseeds = recipients.map(() => new Uint8Array(randomBytes(64)));
  const sealed = seal({
    act,
    key,
    recipients,
    random: {
      containerKey: new Uint8Array(randomBytes(32)),
      nonce: new Uint8Array(randomBytes(24)),
      eseeds
    }
  });
  const parts = sealedParts(sealed);
  recipients.forEach((r, i) => record({ kind: "encapsulate", publicKey: r.key, eseed: eseeds[i], ct: parts.capsules[i] }));
  return sealed;
}
function failure(home, e2) {
  if (e2 instanceof RelayError) return { home, error: e2.reason, code: e2.code };
  return { home, error: String(e2) };
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
    const start2 = i - 1;
    i++;
    if (m === EOI) {
      if (!frameSeen) throw new NotJpeg("it has no frame header");
      out.push({ marker: m, start: start2, end: i, body: new Uint8Array(0) });
      return { segments: out, end: i };
    }
    if (m === SOI) throw new NotJpeg("a second start marker before the end");
    if (m === 0 || m === 1 || m >= 208 && m <= 215) throw new NotJpeg(`a stray marker FF${hex2(m)} at ${start2}`);
    if (i + 2 > b.length) throw new NotJpeg("it ends inside a segment");
    const len = u16(b, i);
    if (len < 2 || i + len > b.length) throw new NotJpeg(`a segment runs past the end of the file at ${start2}`);
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
    out.push({ marker: m, start: start2, end: i, body });
  }
}
var hex2 = (n) => n.toString(16).toUpperCase().padStart(2, "0");
function readExif(body) {
  const none2 = { orientation: null, location: false, thumbnail: false };
  if (!ascii(body, 0, "Exif\0\0")) return none2;
  const t = body.subarray(6);
  if (t.length < 8) return none2;
  const le = t[0] === 73 && t[1] === 73;
  const be = t[0] === 77 && t[1] === 77;
  if (!le && !be) return none2;
  const r16 = (o) => o + 2 > t.length ? -1 : le ? t[o] | t[o + 1] << 8 : t[o] << 8 | t[o + 1];
  const r32 = (o) => o + 4 > t.length ? -1 : le ? (t[o] | t[o + 1] << 8 | t[o + 2] << 16 | t[o + 3] << 24) >>> 0 : (t[o] << 24 | t[o + 1] << 16 | t[o + 2] << 8 | t[o + 3]) >>> 0;
  if (r16(2) !== 42) return none2;
  const ifd0 = r32(4);
  const entries = (o) => {
    const n = r16(o);
    if (n < 0 || o + 2 + 12 * n + 4 > t.length) return null;
    const list3 = [];
    for (let k = 0; k < n; k++) {
      const at = o + 2 + 12 * k;
      list3.push({ tag: r16(at), type: r16(at + 2), count: r32(at + 4), at: at + 8 });
    }
    return { list: list3, next: r32(o + 2 + 12 * n) };
  };
  const first = entries(ifd0);
  if (!first) return none2;
  let orientation = null;
  let location2 = false;
  for (const e2 of first.list) {
    if (e2.tag === 274 && e2.type === 3 && e2.count === 1) orientation = r16(e2.at);
    if (e2.tag === 34853) location2 = true;
  }
  let thumbnail = false;
  if (first.next > 0 && first.next < t.length) {
    const second = entries(first.next);
    if (second) thumbnail = second.list.some((e2) => e2.tag === 513 || e2.tag === 273);
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
        const e2 = readExif(s.body);
        if (!exifSeen) orientation = e2.orientation;
        exifSeen = true;
        if (e2.location) carries.add("location");
        if (e2.thumbnail) carries.add("exif-thumbnail");
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
  const e2 = readExif(body);
  if (e2.orientation === null || e2.orientation < 2 || e2.orientation > 8) return false;
  const want = orientationExif(e2.orientation);
  return body.length === want.length && body.every((x, i) => x === want[i]);
}
function strip(b) {
  const p = read(b);
  const parts = [Uint8Array.from([255, SOI])];
  const hasJfif = p.segments.some((s) => s.marker === APP0 && isJfif(s.body));
  if (!hasJfif && p.orientation !== 1) parts.push(segment(APP1, orientationExif(p.orientation)));
  let jfifDone = false;
  for (const s of p.segments) {
    const m = s.marker;
    if (m === EOI) break;
    if (m === APP0 && isJfif(s.body) && !jfifDone) {
      const body = s.body.slice(0, 14);
      body[12] = 0;
      body[13] = 0;
      parts.push(segment(APP0, body));
      jfifDone = true;
      if (p.orientation !== 1) parts.push(segment(APP1, orientationExif(p.orientation)));
      continue;
    }
    if (m >= APP0 && m <= 239) {
      if (m === APP2 && ascii(s.body, 0, "ICC_PROFILE\0")) parts.push(b.subarray(s.start, s.end));
      else if (m === APP14 && ascii(s.body, 0, "Adobe")) parts.push(b.subarray(s.start, s.end));
      continue;
    }
    if (m === COM) continue;
    parts.push(b.subarray(s.start, s.end));
  }
  parts.push(Uint8Array.from([255, EOI]));
  const bytes2 = concat(parts);
  const after = read(bytes2);
  if (after.carries.length) throw new Error(`stripping left ${after.carries.join(", ")}`);
  return { bytes: bytes2, removed: p.carries, picture: after };
}
function segment(marker, body) {
  const out = new Uint8Array(4 + body.length);
  out[0] = 255;
  out[1] = marker;
  out[2] = body.length + 2 >> 8;
  out[3] = body.length + 2 & 255;
  out.set(body, 4);
  return out;
}
function concat(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// ../longform/src/specs.ts
var test = (s) => sha2562(s);
var LONGFORM_SPECS = {
  /** The Text MIR (`TEXT`). */
  text: SPECS.text,
  /** The long-form text format cMIP (cmips/cmip-long-form-draft-1.md). */
  longform: test("long-form text format cMIP, draft 1, test value until publication")
};

// ../barebone/src/specs.ts
var test2 = (s) => sha2562(s);
var POST_SPECS = {
  /** The Text MIR (`TEXT`). */
  text: LONGFORM_SPECS.text,
  /** The Envelopes MIR (`ENVELOPES`). */
  envelopes: SPECS.envelopes,
  /** The long-form text format cMIP: a post naming it is rendered with it. */
  longform: LONGFORM_SPECS.longform,
  /** The JPEG Module (modules/module-jpeg-draft-1.md). */
  jpeg: test2("JPEG Module, draft 1, test value until publication")
};
var TEXT_ACT = 0;
var PUBLICATION = 0;
var WITHDRAWAL = 3;

// ../barebone/src/post.ts
async function carryChain(by, relays) {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
      }
    }
  }
}
async function publishPicture(by, jpeg, relays) {
  const s = strip(jpeg);
  const l = lockMedia(s.bytes);
  const payload = cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(POST_SPECS.jpeg)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      [3, s.bytes.length],
      [4, l.nonce],
      [5, l.key],
      [6, relays]
    ])
  );
  await carryChain(by, relays);
  const made = await by.publish(POST_SPECS.envelopes, PUBLICATION, payload, { public: true, relays });
  for (const hint of relays) await relayAt(hint, by.via).putMedia(l.locked);
  return { id: made.id, act: made.act, removed: s.removed, picture: s.picture, work: l.workHash, size: s.bytes.length };
}
function textPayload(text2, format = null) {
  const m = /* @__PURE__ */ new Map([[0, text2]]);
  if (format) m.set(1, unhex(format));
  return cborEncode(m);
}
async function post(by, opts) {
  const picture2 = opts.jpeg ? await publishPicture(by, opts.jpeg, opts.relays) : null;
  await carryChain(by, opts.relays);
  const made = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(opts.text, opts.format ?? null), {
    public: true,
    relays: opts.relays,
    refs: picture2 ? [referenceTo(picture2.act)] : void 0,
    to: opts.to?.length ? opts.to : void 0
  });
  return { id: made.id, act: made.act, picture: picture2 };
}
async function leaveInInbox(by, act, inbox) {
  const out = { left: [], failed: [] };
  for (const hint of inbox) {
    try {
      const r = relayAt(hint, by.via);
      for (const c of by.chainActs()) await r.putAct(c).catch(() => void 0);
      await r.putAct(act);
      out.left.push(hint);
    } catch (e2) {
      out.failed.push({ relay: hint, reason: e2 instanceof Error ? e2.message : String(e2) });
    }
  }
  return out;
}
async function withdraw(by, publication, relays) {
  const made = await by.publish(POST_SPECS.envelopes, WITHDRAWAL, cborEncode(/* @__PURE__ */ new Map()), {
    public: true,
    relays,
    objects: [[publication, publication]]
  });
  return { id: made.id };
}
async function fetchAct(id, hints, via2) {
  return firstOf(hints.filter((h) => !cannotReach(h, via2)), (h) => relayAt(h, via2).getAct(id));
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
  constructor(hints, via2) {
    this.hints = hints;
    this.via = via2;
    this.v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  }
  v;
  /** Addresses not tried by any lookup, each with why. */
  notTried = [];
  looked = /* @__PURE__ */ new Map();
  async standing(act, id, signer) {
    let l = this.looked.get(signer);
    if (!l) {
      l = lookUp(signer, this.hints, this.via, this.v).then(async (x) => {
        for (const n of x.notTried) if (!this.notTried.some((y) => y.hint === n.hint)) this.notTried.push(n);
        await holdSequence(this.v, signer, x, this.hints, this.via);
      });
      this.looked.set(signer, l);
    }
    await l;
    this.v.add(act);
    return this.v.status(id);
  }
};
async function readPost(id, hints, via2 = {}, judging) {
  const act = await fetchAct(id, hints, via2);
  if (!act) throw new Error(`the act ${id} was not found at ${hints.join(", ")}`);
  const d = describeChecked(act, id);
  if (!d.public) throw new Error("the post is not public");
  if (d.spec !== POST_SPECS.text || d.type !== TEXT_ACT) throw new Error("the act is not a text act");
  if (!d.signer) throw new Error("the act has no signer");
  const p = cborDecode(d.payload);
  const text2 = p.get(0);
  if (typeof text2 !== "string") throw new Error("the text act has no text");
  const f = p.get(1);
  const judge = judging ?? new Judge(hints, via2);
  const standing = await judge.standing(act, id, d.signer);
  const named = (d.refs ?? []).map((r, i) => d.refSigners?.[i] ? [r, d.refSigners[i]] : r);
  const refs = await Promise.all(named.map((r) => readRef(r, hints, via2, judge)));
  return { id, signer: d.signer, standing, text: text2, format: f instanceof Uint8Array ? hex(f) : null, refs, notTried: judge.notTried ?? [] };
}
async function readRef(r, hints, via2, judge) {
  const id = typeof r === "string" ? r : r[0];
  const signer = typeof r === "string" ? void 0 : r[1];
  let act = null;
  try {
    const f = await followRef(r, hints, via2);
    act = f.act;
    if (judge.notTried) {
      for (const n of f.notTried) if (!judge.notTried.some((x) => x.hint === n.hint)) judge.notTried.push(n);
    }
  } catch (e2) {
    const why = e2 instanceof Error ? e2.message : String(e2);
    if (/the reference is wrong/.test(why)) return { kind: "act", id, signer, what: why };
  }
  if (!act) return { kind: "act", id, signer, what: signer ? "not found at the relays asked, nor at its signer's routes and homes" : "not found at the relays asked" };
  let d;
  try {
    d = describeChecked(act, id);
  } catch (e2) {
    return { kind: "act", id, signer, what: `not a valid act: ${e2 instanceof Error ? e2.message : e2}` };
  }
  if (!d.public) return { kind: "act", id, signer, what: "a private act" };
  if (d.spec === POST_SPECS.text && d.type === TEXT_ACT) return { kind: "act", id, signer, what: "a text act" };
  if (d.spec !== POST_SPECS.envelopes || d.type !== PUBLICATION) return { kind: "act", id, signer, what: "an act of a specification this client does not implement" };
  return readPicture(act, d, hints, via2, judge);
}
async function readPicture(act, d, hints, via2, judge) {
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
  out.withdrawn = await findWithdrawal(d.id, d.signer, m.get(8), hints, via2, judge);
  if (out.withdrawn) return no("withdrawn by its signer");
  const named = Array.isArray(m.get(6)) ? m.get(6).filter((x) => typeof x === "string") : [];
  const media = (places) => firstOf(places.filter((h) => !cannotReach(h, via2)), (h) => relayAt(h, via2).getMedia(hex(lockedHash)));
  const locked = await media(hints) ?? await media(named.filter((n) => !hints.includes(n)));
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
  } catch (e2) {
    if (e2 instanceof NotJpeg) return no(`not a JPEG this client reads: ${e2.message}`);
    throw e2;
  }
  out.bytes = plain;
  return out;
}
async function findWithdrawal(publication, signer, forId, hints, via2, judge) {
  const who = [signer];
  if (forId instanceof Uint8Array) who.push(hex(forId));
  const search = async (h, s) => {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via2).feed({ signer: s, after });
      } catch {
        return null;
      }
      for (const it of page.items) {
        if (it.kind !== "act") continue;
        let d;
        try {
          d = describeAct(it.item);
        } catch {
          continue;
        }
        if (d.spec !== POST_SPECS.envelopes || d.type !== WITHDRAWAL || !d.signer) continue;
        if (!(d.objects ?? []).some(([chain]) => chain === publication)) continue;
        if (await judge.standing(it.item, d.id, d.signer) === "valid") return d.id;
      }
      if (!page.items.length || page.next === after) return null;
      after = page.next;
    }
  };
  const pairs = hints.filter((h) => !cannotReach(h, via2)).flatMap((h) => who.map((s) => [h, s]));
  return firstOf(pairs, ([h, s]) => search(h, s));
}
async function listPosts(signer, hint, via2 = {}) {
  const out = [];
  let after;
  for (; ; ) {
    const page = await relayAt(hint, via2).feed({ signer, after });
    for (const it of page.items) {
      if (it.kind !== "act") continue;
      try {
        const d = describeAct(it.item);
        if (d.spec === POST_SPECS.text && d.type === TEXT_ACT) out.push(d.id);
      } catch {
      }
    }
    if (!page.items.length || page.next === after) break;
    after = page.next;
  }
  return out;
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
function linkOpenShown(s, i) {
  return underFloor(s, i) !== null;
}
var AUTOLINK = /^<((?:https?|mailto):[^ <>]+)>/;
function parse(source) {
  const lines2 = [];
  let start2 = 0;
  for (; ; ) {
    const lf = source.indexOf("\n", start2);
    if (lf < 0) {
      lines2.push({ from: start2, to: source.length });
      break;
    }
    lines2.push({ from: start2, to: lf });
    start2 = lf + 1;
  }
  const p = new Parser(source);
  const blocks = p.blocks(lines2, 0);
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
    if (depth < MAX_DEPTH && (this.quoteOpens(l) || this.marker(l))) return true;
    return false;
  }
  /**
   * Does this line open a quote? A `>` opening it does, unless the Text
   * MIR's floor forbids hiding it (a mathematical sign directly before a
   * digit, `>5`): then it is shown as text, and the line is no quote
   * (F182).
   */
  quoteOpens(l) {
    return l.from < l.to && this.s[l.from] === ">" && underFloor(this.s, l.from) === null;
  }
  blocks(lines2, depth) {
    const out = [];
    let i = 0;
    while (i < lines2.length) {
      const l = lines2[i];
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
        while (i < lines2.length) {
          const y = this.text(lines2[i]);
          if (/^`+$/.test(y) && y.length >= n) {
            this.mark("fence-close", lines2[i].from, lines2[i].to);
            i++;
            break;
          }
          body.push(lines2[i]);
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
      if (depth < MAX_DEPTH && this.quoteOpens(l)) {
        const inner = [];
        while (i < lines2.length && this.quoteOpens(lines2[i])) {
          const q = lines2[i];
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
        while (i < lines2.length) {
          const mk = this.marker(lines2[i]);
          if (!mk || mk.kind !== first.kind) break;
          const w = mk.width;
          this.mark("item", lines2[i].from + w - 1, lines2[i].from + w);
          const body = [{ from: lines2[i].from + w, to: lines2[i].to }];
          i++;
          const indent = " ".repeat(w);
          while (i < lines2.length) {
            const y = this.text(lines2[i]);
            if (y.startsWith(indent)) {
              this.mark("indent", lines2[i].from, lines2[i].from + w);
              body.push({ from: lines2[i].from + w, to: lines2[i].to });
              i++;
              continue;
            }
            if (y === "") {
              let j2 = i;
              while (j2 < lines2.length && this.text(lines2[j2]) === "") j2++;
              if (j2 < lines2.length && this.text(lines2[j2]).startsWith(indent)) {
                for (; i < j2; i++) body.push({ from: lines2[i].from, to: lines2[i].to });
                continue;
              }
            }
            break;
          }
          items.push({ marker: mk.marker, children: this.blocks(body, depth + 1) });
          let j = i;
          while (j < lines2.length && this.text(lines2[j]) === "") j++;
          const next = j < lines2.length ? this.marker(lines2[j]) : null;
          if (!next || next.kind !== first.kind) break;
          i = j;
        }
        out.push({ t: "list", ordered: first.kind === ".", items });
        continue;
      }
      const children = [...this.inline(l)];
      i++;
      while (i < lines2.length && this.text(lines2[i]) !== "" && !this.starts(lines2[i], depth)) {
        children.push({ t: "break", at: lines2[i - 1].to }, ...this.inline(lines2[i]));
        i++;
      }
      out.push({ t: "paragraph", children });
    }
    return out;
  }
  // -------------------------------------------------------------- inlines
  /**
   * The inline content of one line (rule 9). Where the Text MIR's floor
   * forbids hiding a piece of emphasis, code or link markup (a run of
   * hidden markup between two digits, `1*2*3`, `1`2`3`), that piece is
   * shown as text rather than the document refused (F175, F182): the line
   * is read again with it as text, until no hidden run lies between two
   * digits.
   */
  inline(l) {
    const literal = /* @__PURE__ */ new Set();
    for (; ; ) {
      const from = this.marks.length;
      const nodes = this.inlineOnce(l, literal);
      const at = this.betweenDigits(from);
      if (at === null) return nodes;
      this.marks.length = from;
      literal.add(at);
    }
  }
  /**
   * The first run of markup hidden since mark `from` that lies between two
   * digits, as the offset to read as text instead: an emphasis run, a code
   * span's or a link's opening sign. Null if none.
   */
  betweenDigits(from) {
    const s = this.s;
    const ms = this.marks.slice(from).sort((a, b) => a.span.from - b.span.from);
    for (let i = 0; i < ms.length; ) {
      let j = i;
      while (j + 1 < ms.length && ms[j + 1].span.from === ms[j].span.to) j++;
      if (isDigit(charBefore(s, ms[i].span.from)) && isDigit(charAt(s, ms[j].span.to))) {
        const m = ms.slice(i, j + 1).find((x) => x.rule !== "escape") ?? ms[i];
        if (m.rule === "code-close") return [...ms].reverse().find((x) => x.rule === "code-open" && x.span.from < m.span.from).span.from;
        if (m.rule === "link-close") return s.lastIndexOf("<", m.span.from);
        return m.span.from;
      }
      i = j + 1;
    }
    return null;
  }
  /** One reading of a line's inline content, with the offsets in `literal` read as text. */
  inlineOnce(l, literal) {
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
      if (c === "\\" && p + 1 < l.to && ESCAPABLE.has(s[p + 1]) && !literal.has(p)) {
        flush(p);
        this.mark("escape", p, p + 1);
        run = p + 1;
        p += 2;
        continue;
      }
      if (c === "`") {
        let n = 0;
        while (p + n < l.to && s[p + n] === "`") n++;
        if (literal.has(p)) {
          lit(p);
          p += n;
          continue;
        }
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
        const m = literal.has(p) ? null : AUTOLINK.exec(s.slice(p, l.to));
        if (m) {
          const span = { from: p + 1, to: p + 1 + m[1].length };
          if (linkOpenShown(s, p)) {
            lit(p);
            flush(p + 1);
          } else {
            flush(p);
            this.mark("link-open", p, p + 1);
          }
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
        if (n > 3 || literal.has(p)) {
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
    const top2 = () => frames[frames.length - 1];
    for (const tk of toks) {
      if (tk.k === "node") {
        top2().push(tk.node);
      } else if (tk.pair === "open") {
        this.mark("em-open", tk.span.from, tk.span.to);
        const outer = [];
        if (tk.n === 1) {
          top2().push({ t: "em", children: outer });
          frames.push(outer);
        } else if (tk.n === 2) {
          top2().push({ t: "strong", children: outer });
          frames.push(outer);
        } else {
          const inner = [];
          top2().push({ t: "strong", children: [{ t: "em", children: inner }] });
          frames.push(inner);
        }
      } else if (tk.pair === "close") {
        this.mark("em-close", tk.span.from, tk.span.to);
        frames.pop();
      } else {
        top2().push({ t: "text", span: tk.span });
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
var SIGNS = /* @__PURE__ */ new Set([43, 45, 8722, 8208, 8209, 8210, 8211, 10134, 65123, 65293]);
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
  const state = new Uint8Array(n);
  const leafOf = new Int32Array(n).fill(-1);
  let last = -1;
  for (const [i, leaf] of at) {
    if (i < 0 || i >= n) return `shows offset ${i}, outside the text`;
    if (i <= last) return `shows offset ${i} after ${last}: out of the order of the bytes`;
    last = i;
    state[i] = 1;
    leafOf[i] = leaf;
  }
  const prevShown = new Int32Array(n + 1).fill(-1);
  for (let i = 0; i < n; i++) prevShown[i + 1] = state[i] ? i : prevShown[i];
  const nextShown = new Int32Array(n + 1).fill(-1);
  for (let i = n - 1; i >= 0; i--) nextShown[i] = state[i] ? i : nextShown[i + 1];
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
    if (state[i]) continue;
    const why = underFloor(s, i);
    if (why === BETWEEN && endsABlock(i)) continue;
    if (why === BETWEEN && emphasisOrCode(i)) return floor(i, "emphasis or code markup between two digits");
    if (why) return floor(i, why);
  }
  for (let a = 0; a < n; ) {
    if (state[a]) {
      a++;
      continue;
    }
    let b = a;
    while (b < n && !state[b]) b++;
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
    const e2 = s.indexOf("\n", i);
    return e2 < 0 ? n : e2;
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
      if (state[i]) return `hides ${said(i)} at ${i}, which it also shows`;
      if (!declared[m.rule].includes(s[i])) return `hides ${said(i)} at ${i}, which is not ${m.rule} markup`;
      state[i] = 2;
    }
    const text2 = s.slice(from, to);
    const fail = (why) => `hides ${JSON.stringify(text2)} at ${from}, not in a declared position: ${why}`;
    switch (m.rule) {
      case "heading":
        if (!/^#{1,6} $/.test(text2) || !opensLine(from) || to >= lineEnd(from)) return fail("one to six # and a space, opening a line, before some text");
        break;
      case "rule":
        if (!opensLine(from) || to !== lineEnd(from) || !/^(?:-{3,}|\*{3,})$/.test(text2)) return fail("a whole line of three or more - or *");
        break;
      case "fence-open":
        if (!opensLine(from) || to - from < 3 || !wholeRun(m, "`") || s.slice(to, lineEnd(from)).includes("`")) return fail("three or more backticks opening a line, nothing after them a backtick");
        break;
      case "fence-close":
        if (!opensLine(from) || to !== lineEnd(from)) return fail("a whole line of backticks");
        break;
      case "quote":
        if (s[from] !== ">" || to - from === 2 && s[from + 1] !== " " || !opensLine(from)) return fail("a > and one space, opening a line");
        break;
      case "item":
        if (from === 0 || !markers[from - 1] || to - from !== 1) return fail("the one space after a list marker");
        break;
      case "indent":
        if (!opensLine(from) || !/^ +$/.test(text2)) return fail("spaces opening an item's later line");
        break;
      case "escape":
        if (to - from !== 1 || to >= lineEnd(from) || !ESCAPABLE.has(s[to]) || state[to] !== 1) return fail("a backslash before a character it escapes");
        break;
      case "code-open":
        if (code || !wholeRun(m, "`")) return fail("a whole run of backticks opening a code span");
        code = m;
        break;
      case "code-close":
        if (!code || !sameLine(code, m) || !wholeRun(m, "`") || to - from !== code.span.to - code.span.from) return fail("a run of as many backticks closing a code span on its line");
        code = null;
        break;
      case "link-open": {
        const a = AUTOLINK.exec(s.slice(from, lineEnd(from)));
        if (!a || link) return fail("a < opening a link to an https, http or mailto address");
        const close = from + a[0].length - 1;
        if (state[close] === 1) {
          if (!closeShown(close)) return fail("a link whose closing > is shown, though not next to a digit");
        } else link = m;
        break;
      }
      case "link-close": {
        const o = link ? link.span.from : s.lastIndexOf("<", from);
        if (!link && !(o >= lineStart(from) && state[o] === 1 && linkOpenShown(s, o))) return fail("the > closing a link");
        const a = AUTOLINK.exec(s.slice(o, lineEnd(o)));
        if (!a || o + a[0].length !== to) return fail("the > closing a link");
        if (closeShown(from)) return fail("the > closing a link, next to a digit, is shown");
        link = null;
        break;
      }
      case "em-open":
        if (to - from > 3 || !wholeRun(m, "*") || to >= lineEnd(from) || isSpaceAt(to)) return fail("a run of one to three * before a character not a space");
        stack.push(m);
        break;
      case "em-close": {
        const o = stack.pop();
        if (to - from > 3 || !wholeRun(m, "*") || from <= lineStart(from) || isSpaceAt(from - 1)) return fail("a run of one to three * after a character not a space");
        if (!o || !sameLine(o, m) || o.span.to - o.span.from !== to - from) return fail("no opener of its length on its line");
        break;
      }
    }
  }
  if (stack.length || code || link) return "an opening sign is never closed on its line";
  let prev = -1;
  const next = new Int32Array(n + 1).fill(-1);
  for (let i = n - 1; i >= 0; i--) next[i] = state[i] === 1 ? i : next[i + 1];
  for (let i = 0; i < n; i++) {
    if (state[i] === 1) {
      prev = i;
      continue;
    }
    if (state[i] === 2) continue;
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
    return `<div class="mor-lf"><p class="mor-lf-refused">Shown plain: the long-form rendering would break the Text MIR's bound (${escapeHtml(breach)}).</p>${plainHtml(doc.source, { showControls: true })}</div>`;
  }
  const s = doc.source;
  const text2 = (x) => escapeHtml(s.slice(x.from, x.to));
  const inl = (ns) => ns.map((n) => {
    switch (n.t) {
      case "text":
        return text2(n.span);
      case "break":
        return "<br>";
      case "em":
        return `<em>${inl(n.children)}</em>`;
      case "strong":
        return `<strong>${inl(n.children)}</strong>`;
      case "code":
        return `<code>${text2(n.span)}</code>`;
      case "link":
        return `<a href="${escapeHtml(n.href)}" rel="nofollow noopener noreferrer">${text2(n.span)}</a>`;
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
        const items = b.items.map((it) => `<li><span class="mor-lf-marker">${text2(it.marker)}</span><div>${blk(it.children)}</div></li>`).join("");
        return `<${tag}>${items}</${tag}>`;
      }
      case "code": {
        const label = b.label ? `<span class="mor-lf-label">${text2(b.label)}</span>` : "";
        return `<pre dir="auto">${label}<code>${b.lines.map(text2).join("\n")}</code></pre>`;
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
  const text2 = p.format === POST_SPECS.longform ? renderHtml(parse(p.text)) : `<div class="mor-post-text" dir="auto">${escapeHtml(p.text)}</div>`;
  const others = p.refs.filter((r) => r.kind === "act").map((r) => {
    const by = r.kind === "act" && r.signer ? `, signed by <code title="${r.signer}">${short(r.signer)}</code> as the reference says` : "";
    return `<div class="mor-post-by">Refers to <code>${short(r.id)}</code>${by}: ${escapeHtml(r.kind === "act" ? r.what : "")}.</div>`;
  }).join("");
  const pictures = p.refs.filter((r) => r.kind === "picture").map((r) => picture(r, p.signer)).join("");
  const notTried = (p.notTried ?? []).map((n) => `<div class="mor-post-by">Not tried: <code>${escapeHtml(n.hint)}</code>, ${escapeHtml(n.why)}. What it holds was not asked for; silence proves nothing.</div>`).join("");
  const bad = p.standing === "valid" ? "" : " mor-post-bad";
  return `<article class="mor-post">
<div class="mor-post-by${bad}">By <code title="${p.signer}">${short(p.signer)}</code>, ${standingWords(p.standing)}. Post <code title="${p.id}">${short(p.id)}</code>.</div>
${text2}${pictures}${others}${notTried}
<details><summary>Plain text</summary>${plainHtml(p.text, { showControls: true })}</details>
</article>`;
}

// ../longform/src/text.ts
var SPACE = "[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]";
var TRAILING = new RegExp(`${SPACE}+$`, "gmu");
var TRAILING_END = new RegExp(`(?:${SPACE}|
)+$`, "u");
var CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/gu;
var NONCHAR = /[\uFDD0-\uFDEF\uFFFE\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/gu;
function compose(raw) {
  const changes = [];
  let t = raw;
  const step = (next, what) => {
    if (next !== t) changes.push(what);
    t = next;
  };
  step(t.replace(/\r\n?|[\u2028\u2029]/g, "\n"), "line breaks converted to LF");
  step(t.replace(/\uFEFF/g, ""), "byte order marks removed");
  step(t.replace(/\t/g, "    "), "tabs replaced with four spaces");
  step(t.replace(CONTROL, ""), "control characters removed");
  step(t.replace(NONCHAR, ""), "noncharacters removed");
  step(nfc(t), "normalized to NFC");
  step(t.replace(TRAILING, ""), "trailing spaces removed");
  step(t.replace(TRAILING_END, ""), "final line breaks removed");
  return { text: t, changes };
}

// ../../modules/carry/src/english.ts
var ENGLISH = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "age",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "all",
  "alley",
  "allow",
  "almost",
  "alone",
  "alpha",
  "already",
  "also",
  "alter",
  "always",
  "amateur",
  "amazing",
  "among",
  "amount",
  "amused",
  "analyst",
  "anchor",
  "ancient",
  "anger",
  "angle",
  "angry",
  "animal",
  "ankle",
  "announce",
  "annual",
  "another",
  "answer",
  "antenna",
  "antique",
  "anxiety",
  "any",
  "apart",
  "apology",
  "appear",
  "apple",
  "approve",
  "april",
  "arch",
  "arctic",
  "area",
  "arena",
  "argue",
  "arm",
  "armed",
  "armor",
  "army",
  "around",
  "arrange",
  "arrest",
  "arrive",
  "arrow",
  "art",
  "artefact",
  "artist",
  "artwork",
  "ask",
  "aspect",
  "assault",
  "asset",
  "assist",
  "assume",
  "asthma",
  "athlete",
  "atom",
  "attack",
  "attend",
  "attitude",
  "attract",
  "auction",
  "audit",
  "august",
  "aunt",
  "author",
  "auto",
  "autumn",
  "average",
  "avocado",
  "avoid",
  "awake",
  "aware",
  "away",
  "awesome",
  "awful",
  "awkward",
  "axis",
  "baby",
  "bachelor",
  "bacon",
  "badge",
  "bag",
  "balance",
  "balcony",
  "ball",
  "bamboo",
  "banana",
  "banner",
  "bar",
  "barely",
  "bargain",
  "barrel",
  "base",
  "basic",
  "basket",
  "battle",
  "beach",
  "bean",
  "beauty",
  "because",
  "become",
  "beef",
  "before",
  "begin",
  "behave",
  "behind",
  "believe",
  "below",
  "belt",
  "bench",
  "benefit",
  "best",
  "betray",
  "better",
  "between",
  "beyond",
  "bicycle",
  "bid",
  "bike",
  "bind",
  "biology",
  "bird",
  "birth",
  "bitter",
  "black",
  "blade",
  "blame",
  "blanket",
  "blast",
  "bleak",
  "bless",
  "blind",
  "blood",
  "blossom",
  "blouse",
  "blue",
  "blur",
  "blush",
  "board",
  "boat",
  "body",
  "boil",
  "bomb",
  "bone",
  "bonus",
  "book",
  "boost",
  "border",
  "boring",
  "borrow",
  "boss",
  "bottom",
  "bounce",
  "box",
  "boy",
  "bracket",
  "brain",
  "brand",
  "brass",
  "brave",
  "bread",
  "breeze",
  "brick",
  "bridge",
  "brief",
  "bright",
  "bring",
  "brisk",
  "broccoli",
  "broken",
  "bronze",
  "broom",
  "brother",
  "brown",
  "brush",
  "bubble",
  "buddy",
  "budget",
  "buffalo",
  "build",
  "bulb",
  "bulk",
  "bullet",
  "bundle",
  "bunker",
  "burden",
  "burger",
  "burst",
  "bus",
  "business",
  "busy",
  "butter",
  "buyer",
  "buzz",
  "cabbage",
  "cabin",
  "cable",
  "cactus",
  "cage",
  "cake",
  "call",
  "calm",
  "camera",
  "camp",
  "can",
  "canal",
  "cancel",
  "candy",
  "cannon",
  "canoe",
  "canvas",
  "canyon",
  "capable",
  "capital",
  "captain",
  "car",
  "carbon",
  "card",
  "cargo",
  "carpet",
  "carry",
  "cart",
  "case",
  "cash",
  "casino",
  "castle",
  "casual",
  "cat",
  "catalog",
  "catch",
  "category",
  "cattle",
  "caught",
  "cause",
  "caution",
  "cave",
  "ceiling",
  "celery",
  "cement",
  "census",
  "century",
  "cereal",
  "certain",
  "chair",
  "chalk",
  "champion",
  "change",
  "chaos",
  "chapter",
  "charge",
  "chase",
  "chat",
  "cheap",
  "check",
  "cheese",
  "chef",
  "cherry",
  "chest",
  "chicken",
  "chief",
  "child",
  "chimney",
  "choice",
  "choose",
  "chronic",
  "chuckle",
  "chunk",
  "churn",
  "cigar",
  "cinnamon",
  "circle",
  "citizen",
  "city",
  "civil",
  "claim",
  "clap",
  "clarify",
  "claw",
  "clay",
  "clean",
  "clerk",
  "clever",
  "click",
  "client",
  "cliff",
  "climb",
  "clinic",
  "clip",
  "clock",
  "clog",
  "close",
  "cloth",
  "cloud",
  "clown",
  "club",
  "clump",
  "cluster",
  "clutch",
  "coach",
  "coast",
  "coconut",
  "code",
  "coffee",
  "coil",
  "coin",
  "collect",
  "color",
  "column",
  "combine",
  "come",
  "comfort",
  "comic",
  "common",
  "company",
  "concert",
  "conduct",
  "confirm",
  "congress",
  "connect",
  "consider",
  "control",
  "convince",
  "cook",
  "cool",
  "copper",
  "copy",
  "coral",
  "core",
  "corn",
  "correct",
  "cost",
  "cotton",
  "couch",
  "country",
  "couple",
  "course",
  "cousin",
  "cover",
  "coyote",
  "crack",
  "cradle",
  "craft",
  "cram",
  "crane",
  "crash",
  "crater",
  "crawl",
  "crazy",
  "cream",
  "credit",
  "creek",
  "crew",
  "cricket",
  "crime",
  "crisp",
  "critic",
  "crop",
  "cross",
  "crouch",
  "crowd",
  "crucial",
  "cruel",
  "cruise",
  "crumble",
  "crunch",
  "crush",
  "cry",
  "crystal",
  "cube",
  "culture",
  "cup",
  "cupboard",
  "curious",
  "current",
  "curtain",
  "curve",
  "cushion",
  "custom",
  "cute",
  "cycle",
  "dad",
  "damage",
  "damp",
  "dance",
  "danger",
  "daring",
  "dash",
  "daughter",
  "dawn",
  "day",
  "deal",
  "debate",
  "debris",
  "decade",
  "december",
  "decide",
  "decline",
  "decorate",
  "decrease",
  "deer",
  "defense",
  "define",
  "defy",
  "degree",
  "delay",
  "deliver",
  "demand",
  "demise",
  "denial",
  "dentist",
  "deny",
  "depart",
  "depend",
  "deposit",
  "depth",
  "deputy",
  "derive",
  "describe",
  "desert",
  "design",
  "desk",
  "despair",
  "destroy",
  "detail",
  "detect",
  "develop",
  "device",
  "devote",
  "diagram",
  "dial",
  "diamond",
  "diary",
  "dice",
  "diesel",
  "diet",
  "differ",
  "digital",
  "dignity",
  "dilemma",
  "dinner",
  "dinosaur",
  "direct",
  "dirt",
  "disagree",
  "discover",
  "disease",
  "dish",
  "dismiss",
  "disorder",
  "display",
  "distance",
  "divert",
  "divide",
  "divorce",
  "dizzy",
  "doctor",
  "document",
  "dog",
  "doll",
  "dolphin",
  "domain",
  "donate",
  "donkey",
  "donor",
  "door",
  "dose",
  "double",
  "dove",
  "draft",
  "dragon",
  "drama",
  "drastic",
  "draw",
  "dream",
  "dress",
  "drift",
  "drill",
  "drink",
  "drip",
  "drive",
  "drop",
  "drum",
  "dry",
  "duck",
  "dumb",
  "dune",
  "during",
  "dust",
  "dutch",
  "duty",
  "dwarf",
  "dynamic",
  "eager",
  "eagle",
  "early",
  "earn",
  "earth",
  "easily",
  "east",
  "easy",
  "echo",
  "ecology",
  "economy",
  "edge",
  "edit",
  "educate",
  "effort",
  "egg",
  "eight",
  "either",
  "elbow",
  "elder",
  "electric",
  "elegant",
  "element",
  "elephant",
  "elevator",
  "elite",
  "else",
  "embark",
  "embody",
  "embrace",
  "emerge",
  "emotion",
  "employ",
  "empower",
  "empty",
  "enable",
  "enact",
  "end",
  "endless",
  "endorse",
  "enemy",
  "energy",
  "enforce",
  "engage",
  "engine",
  "enhance",
  "enjoy",
  "enlist",
  "enough",
  "enrich",
  "enroll",
  "ensure",
  "enter",
  "entire",
  "entry",
  "envelope",
  "episode",
  "equal",
  "equip",
  "era",
  "erase",
  "erode",
  "erosion",
  "error",
  "erupt",
  "escape",
  "essay",
  "essence",
  "estate",
  "eternal",
  "ethics",
  "evidence",
  "evil",
  "evoke",
  "evolve",
  "exact",
  "example",
  "excess",
  "exchange",
  "excite",
  "exclude",
  "excuse",
  "execute",
  "exercise",
  "exhaust",
  "exhibit",
  "exile",
  "exist",
  "exit",
  "exotic",
  "expand",
  "expect",
  "expire",
  "explain",
  "expose",
  "express",
  "extend",
  "extra",
  "eye",
  "eyebrow",
  "fabric",
  "face",
  "faculty",
  "fade",
  "faint",
  "faith",
  "fall",
  "false",
  "fame",
  "family",
  "famous",
  "fan",
  "fancy",
  "fantasy",
  "farm",
  "fashion",
  "fat",
  "fatal",
  "father",
  "fatigue",
  "fault",
  "favorite",
  "feature",
  "february",
  "federal",
  "fee",
  "feed",
  "feel",
  "female",
  "fence",
  "festival",
  "fetch",
  "fever",
  "few",
  "fiber",
  "fiction",
  "field",
  "figure",
  "file",
  "film",
  "filter",
  "final",
  "find",
  "fine",
  "finger",
  "finish",
  "fire",
  "firm",
  "first",
  "fiscal",
  "fish",
  "fit",
  "fitness",
  "fix",
  "flag",
  "flame",
  "flash",
  "flat",
  "flavor",
  "flee",
  "flight",
  "flip",
  "float",
  "flock",
  "floor",
  "flower",
  "fluid",
  "flush",
  "fly",
  "foam",
  "focus",
  "fog",
  "foil",
  "fold",
  "follow",
  "food",
  "foot",
  "force",
  "forest",
  "forget",
  "fork",
  "fortune",
  "forum",
  "forward",
  "fossil",
  "foster",
  "found",
  "fox",
  "fragile",
  "frame",
  "frequent",
  "fresh",
  "friend",
  "fringe",
  "frog",
  "front",
  "frost",
  "frown",
  "frozen",
  "fruit",
  "fuel",
  "fun",
  "funny",
  "furnace",
  "fury",
  "future",
  "gadget",
  "gain",
  "galaxy",
  "gallery",
  "game",
  "gap",
  "garage",
  "garbage",
  "garden",
  "garlic",
  "garment",
  "gas",
  "gasp",
  "gate",
  "gather",
  "gauge",
  "gaze",
  "general",
  "genius",
  "genre",
  "gentle",
  "genuine",
  "gesture",
  "ghost",
  "giant",
  "gift",
  "giggle",
  "ginger",
  "giraffe",
  "girl",
  "give",
  "glad",
  "glance",
  "glare",
  "glass",
  "glide",
  "glimpse",
  "globe",
  "gloom",
  "glory",
  "glove",
  "glow",
  "glue",
  "goat",
  "goddess",
  "gold",
  "good",
  "goose",
  "gorilla",
  "gospel",
  "gossip",
  "govern",
  "gown",
  "grab",
  "grace",
  "grain",
  "grant",
  "grape",
  "grass",
  "gravity",
  "great",
  "green",
  "grid",
  "grief",
  "grit",
  "grocery",
  "group",
  "grow",
  "grunt",
  "guard",
  "guess",
  "guide",
  "guilt",
  "guitar",
  "gun",
  "gym",
  "habit",
  "hair",
  "half",
  "hammer",
  "hamster",
  "hand",
  "happy",
  "harbor",
  "hard",
  "harsh",
  "harvest",
  "hat",
  "have",
  "hawk",
  "hazard",
  "head",
  "health",
  "heart",
  "heavy",
  "hedgehog",
  "height",
  "hello",
  "helmet",
  "help",
  "hen",
  "hero",
  "hidden",
  "high",
  "hill",
  "hint",
  "hip",
  "hire",
  "history",
  "hobby",
  "hockey",
  "hold",
  "hole",
  "holiday",
  "hollow",
  "home",
  "honey",
  "hood",
  "hope",
  "horn",
  "horror",
  "horse",
  "hospital",
  "host",
  "hotel",
  "hour",
  "hover",
  "hub",
  "huge",
  "human",
  "humble",
  "humor",
  "hundred",
  "hungry",
  "hunt",
  "hurdle",
  "hurry",
  "hurt",
  "husband",
  "hybrid",
  "ice",
  "icon",
  "idea",
  "identify",
  "idle",
  "ignore",
  "ill",
  "illegal",
  "illness",
  "image",
  "imitate",
  "immense",
  "immune",
  "impact",
  "impose",
  "improve",
  "impulse",
  "inch",
  "include",
  "income",
  "increase",
  "index",
  "indicate",
  "indoor",
  "industry",
  "infant",
  "inflict",
  "inform",
  "inhale",
  "inherit",
  "initial",
  "inject",
  "injury",
  "inmate",
  "inner",
  "innocent",
  "input",
  "inquiry",
  "insane",
  "insect",
  "inside",
  "inspire",
  "install",
  "intact",
  "interest",
  "into",
  "invest",
  "invite",
  "involve",
  "iron",
  "island",
  "isolate",
  "issue",
  "item",
  "ivory",
  "jacket",
  "jaguar",
  "jar",
  "jazz",
  "jealous",
  "jeans",
  "jelly",
  "jewel",
  "job",
  "join",
  "joke",
  "journey",
  "joy",
  "judge",
  "juice",
  "jump",
  "jungle",
  "junior",
  "junk",
  "just",
  "kangaroo",
  "keen",
  "keep",
  "ketchup",
  "key",
  "kick",
  "kid",
  "kidney",
  "kind",
  "kingdom",
  "kiss",
  "kit",
  "kitchen",
  "kite",
  "kitten",
  "kiwi",
  "knee",
  "knife",
  "knock",
  "know",
  "lab",
  "label",
  "labor",
  "ladder",
  "lady",
  "lake",
  "lamp",
  "language",
  "laptop",
  "large",
  "later",
  "latin",
  "laugh",
  "laundry",
  "lava",
  "law",
  "lawn",
  "lawsuit",
  "layer",
  "lazy",
  "leader",
  "leaf",
  "learn",
  "leave",
  "lecture",
  "left",
  "leg",
  "legal",
  "legend",
  "leisure",
  "lemon",
  "lend",
  "length",
  "lens",
  "leopard",
  "lesson",
  "letter",
  "level",
  "liar",
  "liberty",
  "library",
  "license",
  "life",
  "lift",
  "light",
  "like",
  "limb",
  "limit",
  "link",
  "lion",
  "liquid",
  "list",
  "little",
  "live",
  "lizard",
  "load",
  "loan",
  "lobster",
  "local",
  "lock",
  "logic",
  "lonely",
  "long",
  "loop",
  "lottery",
  "loud",
  "lounge",
  "love",
  "loyal",
  "lucky",
  "luggage",
  "lumber",
  "lunar",
  "lunch",
  "luxury",
  "lyrics",
  "machine",
  "mad",
  "magic",
  "magnet",
  "maid",
  "mail",
  "main",
  "major",
  "make",
  "mammal",
  "man",
  "manage",
  "mandate",
  "mango",
  "mansion",
  "manual",
  "maple",
  "marble",
  "march",
  "margin",
  "marine",
  "market",
  "marriage",
  "mask",
  "mass",
  "master",
  "match",
  "material",
  "math",
  "matrix",
  "matter",
  "maximum",
  "maze",
  "meadow",
  "mean",
  "measure",
  "meat",
  "mechanic",
  "medal",
  "media",
  "melody",
  "melt",
  "member",
  "memory",
  "mention",
  "menu",
  "mercy",
  "merge",
  "merit",
  "merry",
  "mesh",
  "message",
  "metal",
  "method",
  "middle",
  "midnight",
  "milk",
  "million",
  "mimic",
  "mind",
  "minimum",
  "minor",
  "minute",
  "miracle",
  "mirror",
  "misery",
  "miss",
  "mistake",
  "mix",
  "mixed",
  "mixture",
  "mobile",
  "model",
  "modify",
  "mom",
  "moment",
  "monitor",
  "monkey",
  "monster",
  "month",
  "moon",
  "moral",
  "more",
  "morning",
  "mosquito",
  "mother",
  "motion",
  "motor",
  "mountain",
  "mouse",
  "move",
  "movie",
  "much",
  "muffin",
  "mule",
  "multiply",
  "muscle",
  "museum",
  "mushroom",
  "music",
  "must",
  "mutual",
  "myself",
  "mystery",
  "myth",
  "naive",
  "name",
  "napkin",
  "narrow",
  "nasty",
  "nation",
  "nature",
  "near",
  "neck",
  "need",
  "negative",
  "neglect",
  "neither",
  "nephew",
  "nerve",
  "nest",
  "net",
  "network",
  "neutral",
  "never",
  "news",
  "next",
  "nice",
  "night",
  "noble",
  "noise",
  "nominee",
  "noodle",
  "normal",
  "north",
  "nose",
  "notable",
  "note",
  "nothing",
  "notice",
  "novel",
  "now",
  "nuclear",
  "number",
  "nurse",
  "nut",
  "oak",
  "obey",
  "object",
  "oblige",
  "obscure",
  "observe",
  "obtain",
  "obvious",
  "occur",
  "ocean",
  "october",
  "odor",
  "off",
  "offer",
  "office",
  "often",
  "oil",
  "okay",
  "old",
  "olive",
  "olympic",
  "omit",
  "once",
  "one",
  "onion",
  "online",
  "only",
  "open",
  "opera",
  "opinion",
  "oppose",
  "option",
  "orange",
  "orbit",
  "orchard",
  "order",
  "ordinary",
  "organ",
  "orient",
  "original",
  "orphan",
  "ostrich",
  "other",
  "outdoor",
  "outer",
  "output",
  "outside",
  "oval",
  "oven",
  "over",
  "own",
  "owner",
  "oxygen",
  "oyster",
  "ozone",
  "pact",
  "paddle",
  "page",
  "pair",
  "palace",
  "palm",
  "panda",
  "panel",
  "panic",
  "panther",
  "paper",
  "parade",
  "parent",
  "park",
  "parrot",
  "party",
  "pass",
  "patch",
  "path",
  "patient",
  "patrol",
  "pattern",
  "pause",
  "pave",
  "payment",
  "peace",
  "peanut",
  "pear",
  "peasant",
  "pelican",
  "pen",
  "penalty",
  "pencil",
  "people",
  "pepper",
  "perfect",
  "permit",
  "person",
  "pet",
  "phone",
  "photo",
  "phrase",
  "physical",
  "piano",
  "picnic",
  "picture",
  "piece",
  "pig",
  "pigeon",
  "pill",
  "pilot",
  "pink",
  "pioneer",
  "pipe",
  "pistol",
  "pitch",
  "pizza",
  "place",
  "planet",
  "plastic",
  "plate",
  "play",
  "please",
  "pledge",
  "pluck",
  "plug",
  "plunge",
  "poem",
  "poet",
  "point",
  "polar",
  "pole",
  "police",
  "pond",
  "pony",
  "pool",
  "popular",
  "portion",
  "position",
  "possible",
  "post",
  "potato",
  "pottery",
  "poverty",
  "powder",
  "power",
  "practice",
  "praise",
  "predict",
  "prefer",
  "prepare",
  "present",
  "pretty",
  "prevent",
  "price",
  "pride",
  "primary",
  "print",
  "priority",
  "prison",
  "private",
  "prize",
  "problem",
  "process",
  "produce",
  "profit",
  "program",
  "project",
  "promote",
  "proof",
  "property",
  "prosper",
  "protect",
  "proud",
  "provide",
  "public",
  "pudding",
  "pull",
  "pulp",
  "pulse",
  "pumpkin",
  "punch",
  "pupil",
  "puppy",
  "purchase",
  "purity",
  "purpose",
  "purse",
  "push",
  "put",
  "puzzle",
  "pyramid",
  "quality",
  "quantum",
  "quarter",
  "question",
  "quick",
  "quit",
  "quiz",
  "quote",
  "rabbit",
  "raccoon",
  "race",
  "rack",
  "radar",
  "radio",
  "rail",
  "rain",
  "raise",
  "rally",
  "ramp",
  "ranch",
  "random",
  "range",
  "rapid",
  "rare",
  "rate",
  "rather",
  "raven",
  "raw",
  "razor",
  "ready",
  "real",
  "reason",
  "rebel",
  "rebuild",
  "recall",
  "receive",
  "recipe",
  "record",
  "recycle",
  "reduce",
  "reflect",
  "reform",
  "refuse",
  "region",
  "regret",
  "regular",
  "reject",
  "relax",
  "release",
  "relief",
  "rely",
  "remain",
  "remember",
  "remind",
  "remove",
  "render",
  "renew",
  "rent",
  "reopen",
  "repair",
  "repeat",
  "replace",
  "report",
  "require",
  "rescue",
  "resemble",
  "resist",
  "resource",
  "response",
  "result",
  "retire",
  "retreat",
  "return",
  "reunion",
  "reveal",
  "review",
  "reward",
  "rhythm",
  "rib",
  "ribbon",
  "rice",
  "rich",
  "ride",
  "ridge",
  "rifle",
  "right",
  "rigid",
  "ring",
  "riot",
  "ripple",
  "risk",
  "ritual",
  "rival",
  "river",
  "road",
  "roast",
  "robot",
  "robust",
  "rocket",
  "romance",
  "roof",
  "rookie",
  "room",
  "rose",
  "rotate",
  "rough",
  "round",
  "route",
  "royal",
  "rubber",
  "rude",
  "rug",
  "rule",
  "run",
  "runway",
  "rural",
  "sad",
  "saddle",
  "sadness",
  "safe",
  "sail",
  "salad",
  "salmon",
  "salon",
  "salt",
  "salute",
  "same",
  "sample",
  "sand",
  "satisfy",
  "satoshi",
  "sauce",
  "sausage",
  "save",
  "say",
  "scale",
  "scan",
  "scare",
  "scatter",
  "scene",
  "scheme",
  "school",
  "science",
  "scissors",
  "scorpion",
  "scout",
  "scrap",
  "screen",
  "script",
  "scrub",
  "sea",
  "search",
  "season",
  "seat",
  "second",
  "secret",
  "section",
  "security",
  "seed",
  "seek",
  "segment",
  "select",
  "sell",
  "seminar",
  "senior",
  "sense",
  "sentence",
  "series",
  "service",
  "session",
  "settle",
  "setup",
  "seven",
  "shadow",
  "shaft",
  "shallow",
  "share",
  "shed",
  "shell",
  "sheriff",
  "shield",
  "shift",
  "shine",
  "ship",
  "shiver",
  "shock",
  "shoe",
  "shoot",
  "shop",
  "short",
  "shoulder",
  "shove",
  "shrimp",
  "shrug",
  "shuffle",
  "shy",
  "sibling",
  "sick",
  "side",
  "siege",
  "sight",
  "sign",
  "silent",
  "silk",
  "silly",
  "silver",
  "similar",
  "simple",
  "since",
  "sing",
  "siren",
  "sister",
  "situate",
  "six",
  "size",
  "skate",
  "sketch",
  "ski",
  "skill",
  "skin",
  "skirt",
  "skull",
  "slab",
  "slam",
  "sleep",
  "slender",
  "slice",
  "slide",
  "slight",
  "slim",
  "slogan",
  "slot",
  "slow",
  "slush",
  "small",
  "smart",
  "smile",
  "smoke",
  "smooth",
  "snack",
  "snake",
  "snap",
  "sniff",
  "snow",
  "soap",
  "soccer",
  "social",
  "sock",
  "soda",
  "soft",
  "solar",
  "soldier",
  "solid",
  "solution",
  "solve",
  "someone",
  "song",
  "soon",
  "sorry",
  "sort",
  "soul",
  "sound",
  "soup",
  "source",
  "south",
  "space",
  "spare",
  "spatial",
  "spawn",
  "speak",
  "special",
  "speed",
  "spell",
  "spend",
  "sphere",
  "spice",
  "spider",
  "spike",
  "spin",
  "spirit",
  "split",
  "spoil",
  "sponsor",
  "spoon",
  "sport",
  "spot",
  "spray",
  "spread",
  "spring",
  "spy",
  "square",
  "squeeze",
  "squirrel",
  "stable",
  "stadium",
  "staff",
  "stage",
  "stairs",
  "stamp",
  "stand",
  "start",
  "state",
  "stay",
  "steak",
  "steel",
  "stem",
  "step",
  "stereo",
  "stick",
  "still",
  "sting",
  "stock",
  "stomach",
  "stone",
  "stool",
  "story",
  "stove",
  "strategy",
  "street",
  "strike",
  "strong",
  "struggle",
  "student",
  "stuff",
  "stumble",
  "style",
  "subject",
  "submit",
  "subway",
  "success",
  "such",
  "sudden",
  "suffer",
  "sugar",
  "suggest",
  "suit",
  "summer",
  "sun",
  "sunny",
  "sunset",
  "super",
  "supply",
  "supreme",
  "sure",
  "surface",
  "surge",
  "surprise",
  "surround",
  "survey",
  "suspect",
  "sustain",
  "swallow",
  "swamp",
  "swap",
  "swarm",
  "swear",
  "sweet",
  "swift",
  "swim",
  "swing",
  "switch",
  "sword",
  "symbol",
  "symptom",
  "syrup",
  "system",
  "table",
  "tackle",
  "tag",
  "tail",
  "talent",
  "talk",
  "tank",
  "tape",
  "target",
  "task",
  "taste",
  "tattoo",
  "taxi",
  "teach",
  "team",
  "tell",
  "ten",
  "tenant",
  "tennis",
  "tent",
  "term",
  "test",
  "text",
  "thank",
  "that",
  "theme",
  "then",
  "theory",
  "there",
  "they",
  "thing",
  "this",
  "thought",
  "three",
  "thrive",
  "throw",
  "thumb",
  "thunder",
  "ticket",
  "tide",
  "tiger",
  "tilt",
  "timber",
  "time",
  "tiny",
  "tip",
  "tired",
  "tissue",
  "title",
  "toast",
  "tobacco",
  "today",
  "toddler",
  "toe",
  "together",
  "toilet",
  "token",
  "tomato",
  "tomorrow",
  "tone",
  "tongue",
  "tonight",
  "tool",
  "tooth",
  "top",
  "topic",
  "topple",
  "torch",
  "tornado",
  "tortoise",
  "toss",
  "total",
  "tourist",
  "toward",
  "tower",
  "town",
  "toy",
  "track",
  "trade",
  "traffic",
  "tragic",
  "train",
  "transfer",
  "trap",
  "trash",
  "travel",
  "tray",
  "treat",
  "tree",
  "trend",
  "trial",
  "tribe",
  "trick",
  "trigger",
  "trim",
  "trip",
  "trophy",
  "trouble",
  "truck",
  "true",
  "truly",
  "trumpet",
  "trust",
  "truth",
  "try",
  "tube",
  "tuition",
  "tumble",
  "tuna",
  "tunnel",
  "turkey",
  "turn",
  "turtle",
  "twelve",
  "twenty",
  "twice",
  "twin",
  "twist",
  "two",
  "type",
  "typical",
  "ugly",
  "umbrella",
  "unable",
  "unaware",
  "uncle",
  "uncover",
  "under",
  "undo",
  "unfair",
  "unfold",
  "unhappy",
  "uniform",
  "unique",
  "unit",
  "universe",
  "unknown",
  "unlock",
  "until",
  "unusual",
  "unveil",
  "update",
  "upgrade",
  "uphold",
  "upon",
  "upper",
  "upset",
  "urban",
  "urge",
  "usage",
  "use",
  "used",
  "useful",
  "useless",
  "usual",
  "utility",
  "vacant",
  "vacuum",
  "vague",
  "valid",
  "valley",
  "valve",
  "van",
  "vanish",
  "vapor",
  "various",
  "vast",
  "vault",
  "vehicle",
  "velvet",
  "vendor",
  "venture",
  "venue",
  "verb",
  "verify",
  "version",
  "very",
  "vessel",
  "veteran",
  "viable",
  "vibrant",
  "vicious",
  "victory",
  "video",
  "view",
  "village",
  "vintage",
  "violin",
  "virtual",
  "virus",
  "visa",
  "visit",
  "visual",
  "vital",
  "vivid",
  "vocal",
  "voice",
  "void",
  "volcano",
  "volume",
  "vote",
  "voyage",
  "wage",
  "wagon",
  "wait",
  "walk",
  "wall",
  "walnut",
  "want",
  "warfare",
  "warm",
  "warrior",
  "wash",
  "wasp",
  "waste",
  "water",
  "wave",
  "way",
  "wealth",
  "weapon",
  "wear",
  "weasel",
  "weather",
  "web",
  "wedding",
  "weekend",
  "weird",
  "welcome",
  "west",
  "wet",
  "whale",
  "what",
  "wheat",
  "wheel",
  "when",
  "where",
  "whip",
  "whisper",
  "wide",
  "width",
  "wife",
  "wild",
  "will",
  "win",
  "window",
  "wine",
  "wing",
  "wink",
  "winner",
  "winter",
  "wire",
  "wisdom",
  "wise",
  "wish",
  "witness",
  "wolf",
  "woman",
  "wonder",
  "wood",
  "wool",
  "word",
  "work",
  "world",
  "worry",
  "worth",
  "wrap",
  "wreck",
  "wrestle",
  "wrist",
  "write",
  "wrong",
  "yard",
  "year",
  "yellow",
  "you",
  "young",
  "youth",
  "zebra",
  "zero",
  "zone",
  "zoo"
];

// ../../modules/carry/src/carry.ts
var Refused = class extends Error {
};
var INDEX = new Map(ENGLISH.map((w, i) => [w, i]));
function toWords(seed) {
  if (seed.length !== 32) throw new Refused("a signing seed is 32 bytes");
  const check = createHash("sha256").update(seed).digest()[0];
  let bits = 0n;
  for (const b of seed) bits = bits << 8n | BigInt(b);
  bits = bits << 8n | BigInt(check);
  const out = [];
  for (let i = 23; i >= 0; i--) out.push(ENGLISH[Number(bits >> BigInt(i * 11) & 2047n)]);
  return out;
}
function splitWords(written) {
  return written.toLowerCase().split(/\s+/).filter(Boolean);
}
function fromWords(written) {
  const words2 = typeof written === "string" ? splitWords(written) : written.map((w) => w.trim().toLowerCase());
  if (words2.length !== 24) throw new Refused(`${words2.length} words, not 24`);
  let bits = 0n;
  words2.forEach((w, i) => {
    const n = INDEX.get(w);
    if (n === void 0) throw new Refused(`word ${i + 1}, \u201C${w}\u201D, is not on the list: check how it is written`);
    bits = bits << 11n | BigInt(n);
  });
  const seed = new Uint8Array(32);
  for (let i = 0; i < 32; i++) seed[i] = Number(bits >> BigInt(8 + (31 - i) * 8) & 255n);
  const check = Number(bits & 255n);
  if (createHash("sha256").update(seed).digest()[0] !== check) {
    throw new Refused("the checksum does not match: a word was written or read wrong");
  }
  return seed;
}
function readId(typed) {
  const s = typed.replace(/\s+/g, "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(s)) throw new Refused("an ID is 64 characters, 0 to 9 and a to f (spaces do not matter)");
  return s;
}
var groupId = (id) => id.match(/.{1,4}/g).join(" ");
function threePositions(random) {
  const out = /* @__PURE__ */ new Set();
  while (out.size < 3) out.add(1 + random(24));
  return [...out].sort((a, b) => a - b);
}
function typedBack(words2, positions, typed) {
  return positions.length === 3 && typed.length === 3 && positions.every((p, i) => words2[p - 1] === (typed[i] ?? "").trim().toLowerCase());
}

// src/chainwords.ts
var WORDS_KEY_TAG = "MOR/module/seed-words/key";
var SCHEME = 3;
var INDEX2 = 0n;
var cat = (...xs) => {
  const out = new Uint8Array(xs.reduce((n, x) => n + x.length, 0));
  let at = 0;
  for (const x of xs) {
    out.set(x, at);
    at += x.length;
  }
  return out;
};
function taggedHash(tag, data) {
  const t = unhex(sha2562(tag));
  return unhex(sha2562(cat(t, t, data)));
}
function keySeeds(seed, scheme, index) {
  if (seed.length !== 32) throw new Error("a chain-key seed is 32 bytes");
  const i = new Uint8Array(8);
  new DataView(i.buffer).setBigUint64(0, index);
  const a = taggedHash(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(0)));
  const b = taggedHash(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(1)));
  return cat(a, b.subarray(0, 16));
}
function newChainKey(seed) {
  const key = chainKeyFromSeeds(SCHEME, keySeeds(seed, SCHEME, INDEX2));
  return { words: toWords(seed), key };
}

// src/dub.ts
var WORDS_SAY = [
  "Write these 24 words on paper, in order, and keep the paper safe. They are shown once.",
  "Whoever holds these words can post as this identity. They are its signing key; the chain key is not in them.",
  "Type them into another app to post from there as the same identity. They stop working when the signing key is changed.",
  "They are not a Bitcoin wallet. Never type them into one."
];
var CHAIN_WORDS_SAY = [
  "Write these 24 words on paper, in order, and keep the paper away from anything that goes online. They are shown once: neither this page nor this browser keeps them.",
  "They are this identity\u2019s chain key: the only way to change its signing key if it is ever stolen or lost. Without them, the identity can never change its key.",
  "They are the chain-key seed words Module\u2019s backup: the air-gapped chain key Module restores the chain key from them. Never type them into this page, or into any device that goes online.",
  "They are not a Bitcoin wallet. Never type them into one."
];
var CARRY_SAY = [
  "These 24 words and the ID carry this identity to Dub on a computer, or to another device: choose \u201CBring an identity you have\u201D there.",
  "Whoever holds these words can post as this identity. They are its signing key; the chain key is not in them.",
  "Write them on paper; they are the way out of this browser if its storage is lost. They stop working when the signing key is changed.",
  "Each place you bring them keeps its own line of acts. A change of the signing key must keep every line, or that line\u2019s posts become void.",
  "They are not a Bitcoin wallet. Never type them into one."
];
var LINE_SAY = "This app keeps its own line of acts for this identity. If the signing key is ever changed (with the chain key, on the device that holds it), that change must keep this line, or every post made here becomes void. The client making the change reads this line from the homes and relays and keeps it, unless you leave it out; if it cannot read it, give it this line\u2019s latest act, position and summary, shown on this app\u2019s card.";
var NOT_CURRENT = "These words do not give this identity\u2019s current signing key: they are another identity\u2019s, an earlier key\u2019s, or written wrong. Nothing was kept. If these are your chain key\u2019s words, they must never be typed into an online device.";
var list = (xs) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
function randomBelow(n) {
  const limit = Math.floor(4294967296 / n) * n;
  const x = new Uint32Array(1);
  do
    crypto.getRandomValues(x);
  while (x[0] >= limit);
  return x[0] % n;
}
var Dub = class {
  /** `web`: Dub's web client (F281): a new identity's chain key is shown once as words and never kept. */
  constructor(store, opts = {}) {
    this.store = store;
    this.opts = opts;
  }
  queue = Promise.resolve();
  /** One thing at a time: a sequence must never be signed twice at once. */
  serial(f) {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => void 0);
    return next;
  }
  async state() {
    const me = await this.store.identity();
    if (me) {
      const s = await this.store.settings();
      const own = ownLine(me.f.sequence);
      return {
        stage: "ready",
        identity: {
          id: me.id,
          grouped: groupId(me.id),
          kind: s.kind,
          chainKey: s.kind === "brought" ? "elsewhere" : me.f.safety.seeds ? "held" : "shown",
          homes: me.f.homes.map((h) => h.hint),
          relays: s.relays,
          line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null }
        }
      };
    }
    const p = await this.store.pending();
    if (p) return { stage: "confirm", confirm: { positions: p.positions, id: p.identity.identity } };
    return { stage: "doors" };
  }
  async me() {
    const me = await this.store.identity();
    if (!me) throw new Error("No identity yet: make one, or bring one.");
    return me;
  }
  /** Each home's operator, as it declares itself (relay transport cMIP, `info`). */
  async homes(hints, via2) {
    const out = [];
    for (const hint of hints) {
      if (!/^https?:\/\//.test(hint)) throw new Error(`\u201C${hint}\u201D: an address starts with https:// (or http://)`);
      let info;
      try {
        info = await relayAt(hint, via2).info();
      } catch (e2) {
        throw new Error(`${hint} did not answer: ${e2 instanceof Error ? e2.message : e2}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      out.push({ operator: hex(op), hint });
    }
    return out;
  }
  // ------------------------------------------------------------ door 1: a new identity
  /**
   * Make a new identity with the genesis client's code, and show its words
   * once: on the Mac, its signing seed's (the chain key kept in the folder);
   * in the web client, its chain key's, which nothing keeps (F281). Nothing
   * is published until three of the words are typed back (`confirm`).
   * Starting again forgets the last one.
   */
  async begin(a) {
    if (await this.store.identity()) throw new Error("This app already holds an identity.");
    const via2 = a.via ?? {};
    const hints = list(a.homes);
    if (!hints.length) throw new Error("Give at least one home address: where the identity lives, and anyone can check it.");
    const homes = await this.homes(hints, via2);
    const relays = list(a.relays);
    for (const r of relays) if (!/^https?:\/\//.test(r)) throw new Error(`\u201C${r}\u201D: an address starts with https:// (or http://)`);
    const positions = threePositions(randomBelow);
    if (this.opts.web) {
      const seed = crypto.getRandomValues(new Uint8Array(32));
      const chain = newChainKey(seed);
      const id2 = TestIdentity.create({ homes, via: via2, chainKey: chain.key });
      id2.f.safety = { scheme: 0, seeds: "" };
      chain.key.seeds.fill(0);
      await this.store.savePending({ identity: id2.f, positions, relays: relays.length ? relays : hints, via: via2, chainSeed: hex(seed) });
      seed.fill(0);
      return { words: chain.words, positions, say: CHAIN_WORDS_SAY };
    }
    const id = TestIdentity.create({ homes, via: via2, scheme: 3 });
    const words2 = toWords(unhex(id.f.signingSecret));
    await this.store.savePending({ identity: id.f, positions, relays: relays.length ? relays : hints, via: via2 });
    return { words: words2, positions, say: WORDS_SAY };
  }
  /** Forget a new identity before it was published. */
  async abandon() {
    await this.store.dropPending();
  }
  /**
   * The three words typed back. Refused, with nothing published, unless
   * each is the word at its position. Then the genesis goes to the homes,
   * the routes name the relays, and the identity is this app's.
   */
  confirm(typed) {
    return this.serial(async () => {
      const p = await this.store.pending();
      if (!p) throw new Error("No new identity is waiting.");
      const words2 = toWords(unhex(p.chainSeed ?? p.identity.signingSecret));
      if (!typedBack(words2, p.positions, typed)) {
        throw new Error(`Those are not words ${p.positions.join(", ")} as shown. Look at what you wrote down. Nothing has been published.`);
      }
      const id = new TestIdentity(p.identity, p.via);
      const sent = await id.publishGenesis();
      const lines2 = sent.map((x) => ({
        text: `${x.home}: ${x.result?.receipt ? "receipt signed" : `refused (${x.code ?? "?"}) ${x.error ?? ""}`}`,
        tone: x.result?.receipt ? "ok" : "bad"
      }));
      if (!sent.some((x) => x.result?.receipt)) {
        throw new Error(`No home took the identity, so it was not kept. ${lines2.map((l) => l.text).join("; ")}`);
      }
      await this.store.saveSettings({ kind: "made", relays: p.relays, via: p.via });
      await this.store.saveIdentity(id);
      await this.store.dropPending();
      await id.publishRoutes([{ scope: null, hints: p.relays, kind: 0 }]);
      await this.store.saveIdentity(id);
      for (const r of p.relays) {
        for (const act of id.chainActs()) {
          try {
            await relayAt(r, p.via).putAct(act);
          } catch {
          }
        }
      }
      lines2.push({ text: `Its posts are published at ${p.relays.join(", ")}.` });
      return { lines: lines2 };
    });
  }
  // ------------------------------------------------------------ door 2: an identity made elsewhere
  /**
   * Bring an identity made elsewhere (the carry Module, section 4): read its
   * chain from its homes, starting at `address`, and keep it only if the
   * words give its current signing key. Relays are asked for only where
   * its routes name none. This app starts its own line.
   */
  bring(a) {
    return this.serial(async () => {
      if (await this.store.identity()) throw new Error("This app already holds an identity.");
      const via2 = a.via ?? {};
      let id;
      let seed;
      try {
        id = readId(a.id);
        seed = fromWords(a.words);
      } catch (e2) {
        if (e2 instanceof Refused) throw new Error(`${e2.message}. Nothing was kept.`);
        throw e2;
      }
      let pub;
      try {
        pub = signingPublic(seed);
      } catch {
        throw new Error("The words do not hold a signing key. Nothing was kept.");
      }
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error("Give an address where this identity is found (one of its homes), starting with https://.");
      let look;
      try {
        look = await lookUp(id, [address], via2);
      } catch (e2) {
        throw new Error(`This identity was not found at ${address}: ${e2 instanceof Error ? e2.message : e2}`);
      }
      const r = look.resolution;
      if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing can be signed for it until they agree.");
      if (r.stop === "pending" || r.waiting.length) throw new Error("A change of its keys is waiting for its homes: bring it once that change counts, with the new words.");
      if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
      if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
      const binding = r.links[r.links.length - 1];
      let chain = [];
      for (const h of r.homes) {
        try {
          chain = (await relayAt(h.hint, via2).identity(id)).chain;
          if (chain.length) break;
        } catch {
        }
      }
      if (!chain.length) throw new Error("None of its homes served its chain.");
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list(a.relays ?? []);
      if (!relays.length) {
        throw new Error("This identity names no relays for its posts. Give one or more relay addresses, and bring it again.");
      }
      const f = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        // The chain key never travels (the carry Module, 1.3): none is held here.
        safety: { scheme: 0, seeds: "" },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: [],
        pending: null
      };
      await this.store.saveSettings({ kind: "brought", relays, via: via2 });
      await this.store.saveIdentity(new TestIdentity(f, via2));
      return {
        lines: [
          { text: "Its current signing key matches the words.", tone: "ok" },
          { text: named.length ? `Its posts are published at the relays it names: ${relays.join(", ")}.` : `It names no relays: its posts are published at ${relays.join(", ")}.` },
          { text: LINE_SAY, tone: "warn" }
        ]
      };
    });
  }
  /**
   * The identity's ID and carry words (the carry Module), on request: the
   * way out of the web client, to Dub on a computer or another device.
   */
  async carry() {
    const me = await this.me();
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)), say: CARRY_SAY };
  }
  // ------------------------------------------------------------ posting
  /**
   * Refuse to sign once a rotation counts that this app did not make: the
   * key it holds is spent (the carry Module, 4.5; Identity rule 17).
   */
  async current(me) {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing was signed.");
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) {
      throw new Error("This identity\u2019s signing key was changed elsewhere, so the key this app holds no longer counts. Nothing was signed. To post from here again, bring the identity again with its new words.");
    }
  }
  /**
   * Post a text, with a JPEG if one is given, then read it back from the
   * relays, verified. `to`, an identity's ID: a public message to it, as a
   * bug report to the reporting identity is (F287): the post names it as
   * its recipient and is left, unsealed, in its inbox as well, with this
   * identity's chain so it can be checked there. Its inbox is looked up
   * first; an identity declaring none is said, and nothing is signed.
   */
  post(a) {
    return this.serial(async () => {
      const me = await this.me();
      const { text: text2, changes } = compose(a.text);
      if (!text2.trim()) throw new Error("Write something to post.");
      const s = await this.store.settings();
      const relays = s.relays;
      let to = null;
      if (a.to?.trim()) {
        let id;
        try {
          id = readId(a.to);
        } catch (e2) {
          throw new Error(`To: ${e2 instanceof Error ? e2.message : e2}. Nothing was posted.`);
        }
        if (id === me.id) throw new Error("To: that is this identity itself. Nothing was posted.");
        let inbox;
        try {
          inbox = (await lookUp(id, [.../* @__PURE__ */ new Set([...relays, ...me.f.homes.map((h) => h.hint)])], s.via)).inbox(SPECS.text);
        } catch (e2) {
          throw new Error(`To: the identity ${id.slice(0, 12)}\u2026 was not found: ${e2 instanceof Error ? e2.message : e2}. Nothing was posted.`);
        }
        if (!inbox?.length) throw new Error(`To: the identity ${id.slice(0, 12)}\u2026 declares no inbox, so nothing can be left for it. Nothing was posted.`);
        to = { id, inbox };
      }
      await this.current(me);
      let made;
      try {
        made = await post(me, { text: text2, jpeg: a.jpeg, relays, to: to ? [to.id] : void 0 });
      } finally {
        await this.store.saveIdentity(me);
      }
      const lines2 = changes.map((c) => ({ text: `Text: ${c}.` }));
      if (to) {
        const { left, failed: refused } = await leaveInInbox(me, made.act, to.inbox);
        const failed = refused.map((f) => `${f.relay} (${f.reason})`);
        if (left.length) lines2.push({ text: `To ${to.id.slice(0, 12)}\u2026: left in its inbox at ${left.join(", ")}, unsealed: anyone may read it.`, tone: "ok" });
        if (failed.length) lines2.push({ text: `Its inbox did not take it at ${failed.join(", ")}.`, tone: left.length ? "warn" : "bad" });
      }
      if (made.picture) {
        lines2.push({
          text: made.picture.removed.length ? `Taken out of the picture before publishing: ${made.picture.removed.map((c) => CARRIED_WORDS[c]).join("; ")}.` : "The picture carried nothing to take out.",
          tone: "ok"
        });
      }
      return { post: await this.show(made.id), lines: lines2 };
    });
  }
  /** A post as the barebone client's reader shows it: fetched from the relays and verified. */
  async show(id) {
    const me = await this.me();
    const s = await this.store.settings();
    const p = await readPost(id, s.relays, s.via);
    const withdrawable = p.refs.filter((r) => r.kind === "picture").filter((r) => r.signer === me.id && !r.withdrawn && r.standing === "valid").map((r) => r.publication);
    return { id, html: renderPost(p), withdrawable };
  }
  /** This identity's posts at its relays, from every line, newest first. */
  async posts(limit = 20) {
    const me = await this.me();
    const s = await this.store.settings();
    const ids = [];
    for (const r of s.relays) {
      try {
        for (const id of await listPosts(me.id, r, s.via)) if (!ids.includes(id)) ids.push(id);
      } catch {
      }
    }
    const out = [];
    for (const id of ids.reverse().slice(0, limit)) {
      try {
        out.push(await this.show(id));
      } catch (e2) {
        out.push({ id, html: `<p class="small">Post ${id.slice(0, 12)}\u2026 could not be read: ${escapeHtml(String(e2 instanceof Error ? e2.message : e2))}</p>`, withdrawable: [] });
      }
    }
    return out;
  }
  /** Withdraw a picture this identity published (Envelopes, "Withdrawal"): readers stop showing it; the post stands. */
  withdraw(publication) {
    return this.serial(async () => {
      const me = await this.me();
      const s = await this.store.settings();
      if (!/^[0-9a-f]{64}$/.test(publication)) throw new Error("not a publication id");
      const act = await (async () => {
        for (const r of s.relays) {
          try {
            const a = await relayAt(r, s.via).getAct(publication);
            if (a) return a;
          } catch {
          }
        }
        return null;
      })();
      if (!act) throw new Error("That picture was not found at the relays.");
      if (describeAct(act).signer !== me.id) throw new Error("That picture was published by another identity: only its signer can withdraw it.");
      await this.current(me);
      try {
        return await withdraw(me, publication, s.relays);
      } finally {
        await this.store.saveIdentity(me);
      }
    });
  }
};

// ../manage/src/view.ts
var STYLE3 = `:root{color-scheme:light dark;--line:color-mix(in srgb,CanvasText 18%,transparent);--soft:color-mix(in srgb,CanvasText 65%,Canvas);--ok:#1a7f37;--bad:#b3261e;--warn:#9a6700}
@media (prefers-color-scheme:dark){:root{--ok:#4ac26b;--bad:#ff8a80;--warn:#d29922}}
*{box-sizing:border-box}
body{margin:0;background:Canvas;color:CanvasText;font:15px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}
main{max-width:60em;margin:0 auto;padding:20px 16px 64px}
header.top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px 16px;padding-bottom:12px;border-bottom:1px solid var(--line)}
header.top h1{font-size:18px;margin:0}
.small{font-size:13px;color:var(--soft)}
code{font-family:ui-monospace,Menlo,monospace;font-size:.9em;overflow-wrap:anywhere}
section{margin-top:32px}
h2{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--soft);margin:0 0 8px}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;margin:0}
dl.facts dt{color:var(--soft)}
dl.facts dd{margin:0;overflow-wrap:anywhere}
.table{overflow-x:auto}
table{border-collapse:collapse;width:100%}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-weight:600;font-size:13px;color:var(--soft)}
button{font:600 14px system-ui,sans-serif;padding:6px 12px;border-radius:6px;border:1px solid CanvasText;background:CanvasText;color:Canvas;cursor:pointer}
button.quiet{background:transparent;color:CanvasText;border-color:var(--line)}
button.danger{background:var(--bad);border-color:var(--bad);color:#fff}
button:disabled{opacity:.5;cursor:default}
input[type=text],input[type=number]{font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:Canvas;color:CanvasText;min-width:0}
input.wide{width:100%}
form.row,div.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
.note{padding:10px 12px;border-left:3px solid var(--line);margin:12px 0}
.note.error{border-left-color:var(--bad)}
.note.done{border-left-color:var(--ok)}
.note.warn{border-left-color:var(--warn)}
.tag{display:inline-block;font-size:12px;font-weight:600;padding:1px 6px;border-radius:4px;border:1px solid var(--line)}
.tag.ok{color:var(--ok);border-color:var(--ok)}
.tag.bad{color:var(--bad);border-color:var(--bad)}
.tag.warn{color:var(--warn);border-color:var(--warn)}
.code{font:600 20px ui-monospace,Menlo,monospace;letter-spacing:.06em}
#status{position:sticky;top:0;background:Canvas;z-index:1}
details{margin:12px 0}
summary{cursor:pointer;font-weight:600}
ul.plain{list-style:none;padding:0}`;
function e(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// src/page/view.ts
var NAME = "Dub";
var TEST_ONLY = "Test identities only, until MOR is frozen";
var WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. Two risks, in plain words:</p>
<ol><li>Whoever serves this page's code at the moment an identity is made here could copy its keys.</li>
<li>This browser's storage, where the identity's signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div>`;
var KEPT_SAY = "Its signing key is kept in this browser\u2019s storage (IndexedDB), as it is, not locked: the only lock this page could put on it is one it could open by itself, and so could whatever else runs in this page. Its carry words are the way out: write them down.";
var STYLE4 = `${STYLE3}
.banner{margin:12px 0;padding:8px 12px;border:1px solid var(--warn);color:var(--warn);font-weight:600;font-size:13px}
#for-testing-only{max-width:868px;margin:16px auto 0;box-sizing:border-box}
@media (max-width:900px){#for-testing-only{margin:16px 16px 0}}
.banner p,.banner ol{margin:4px 0}
.banner ol{padding-left:1.4em}
.card{border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0}
.card h3{margin:0 0 4px;font-size:17px}
.doors{display:grid;grid-template-columns:repeat(auto-fit,minmax(18em,1fr));gap:12px}
label{display:block;margin:10px 0 4px;font-weight:600;font-size:14px}
textarea{font:inherit;width:100%;min-height:4em;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:Canvas;color:CanvasText}
textarea.write{min-height:8em}
input.wide{width:100%}
.words{display:grid;grid-template-columns:repeat(auto-fill,minmax(9em,1fr));gap:6px 12px;margin:12px 0;padding:12px;border:2px solid CanvasText;border-radius:8px;font:16px ui-monospace,Menlo,monospace}
.words span{white-space:nowrap}
.words b{display:inline-block;min-width:2em;color:var(--soft);font-weight:400}
.say li{margin:4px 0}
.typed{display:flex;flex-wrap:wrap;gap:8px}
.typed label{margin:0;font-weight:400}
.typed input{width:10em}
.published{border:2px solid var(--ok);border-radius:8px;padding:4px 12px;margin:12px 0}
.id{font:14px ui-monospace,Menlo,monospace;overflow-wrap:anywhere}
.copy{font-size:12px;padding:2px 8px;margin-left:8px;vertical-align:baseline}
.here:empty{display:none}
details.more summary{cursor:pointer;color:var(--soft);font-size:13px;margin-top:8px}`;
var note = (kind, html) => `<div class="note ${kind}">${html}</div>`;
var lines = (ls) => `<ul>${ls.map((l) => `<li class="${e(l.tone ?? "")}">${e(l.text)}</li>`).join("")}</ul>`;
function top(web = false) {
  if (web) return `<header class="top"><h1>${NAME}</h1><span class="small">web client, for testing only \xB7 ${e(location.host)}</span></header>`;
  return `<header class="top"><h1>${NAME}</h1><span class="small">this machine only \xB7 ${e(location.host)}</span></header>
<div class="banner" id="test-only">${TEST_ONLY}. Every key is held in software in this program's folder: a prototype, never for a real identity.</div>`;
}
var via = `<details class="more"><summary>Another way to reach an address (rarely needed)</summary>
<label>One per line, as address=where (for example an onion home at its local port)</label><textarea name="via"></textarea></details>`;
function doors(web = false, suggested2 = {}) {
  const make = web ? `<p>A new test identity of your own, made in this browser. You will be shown 24 words to write down, once: its chain key, which this page then forgets. Its signing key stays in this browser.</p>` : `<p>A new identity of your own, made here. You will be shown 24 words to write down, once.</p>`;
  const lines2 = (xs) => e((xs ?? []).join("\n"));
  return `${top(web)}
<div id="status"></div>
<div class="doors">
<section class="card"><h3>Make a new identity</h3>
${make}
<form id="begin">
<label>Its home, where anyone can check it (one address per line)</label><textarea name="homes" required placeholder="https://">${lines2(suggested2.homes)}</textarea>
<label>Relays where its posts are published (one per line; leave empty to use its home)</label><textarea name="relays">${lines2(suggested2.relays)}</textarea>
${web ? "" : via}
<div class="row"><button type="submit">Make it</button></div></form></section>
<section class="card"><h3>Bring an identity you have</h3>
<p>An identity made in another app: its ID and its 24 words. This app reads the identity from its homes and checks that the words give its current signing key.</p>
<form id="bring">
<label>Its ID</label><input class="wide" name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input class="wide" name="address" type="text" placeholder="https://" required>
<label>Relays for its posts (only if the identity names none; one per line)</label><textarea name="relays"></textarea>
${web ? "" : via}
<p class="small">Never type the chain key's words here: the chain key stays on the device that holds it.${web ? ` ${e(KEPT_SAY)}` : ""}</p>
<div class="row"><button type="submit">Bring it</button></div></form></section>
</div>`;
}
function words(ws, positions, say, web = false) {
  return `${top(web)}
<section><h2>${web ? "Write these words down: the chain key" : "Write these words down"}</h2>
<ul class="say">${say.map((s) => `<li>${e(s)}</li>`).join("")}</ul>
<div class="words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>
${typeBack(positions, false, web)}</section>`;
}
function typeBack(positions, again, web = false) {
  const ask2 = again ? `<p>The 24 words of this new identity were shown once. Type three of them from what you wrote down.</p>` : `<p>When they are written down, type three of them back.</p>`;
  return `${again ? top(web) : ""}<div id="status"></div>${ask2}
<form id="confirm"><div class="typed">${positions.map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`).join("")}</div>
<div class="row"><button type="submit">Go on</button> <button type="button" class="quiet" data-action="abandon">Start again with a new identity</button></div></form>
<p class="small">Nothing is published until these three are right.</p>`;
}
function ready(s, web = false) {
  const tail = web ? `<section><h2>Carry it elsewhere</h2><p>The identity's ID and 24 words bring it into Dub on a computer, or onto another device. Write them down: if this browser's storage is lost, they are the only way back.</p>
<div class="row"><button class="quiet" data-action="carry">Show the carry words</button> <button class="quiet" data-action="forget">Forget this identity in this browser</button></div><div id="carry"></div></section>` : `<section><h2>Browsers</h2><div class="row"><button class="quiet" data-action="code">A code for another browser on this machine</button> <button class="quiet" data-action="unpair">Unpair this browser</button></div><div id="code"></div></section>`;
  return `${top(web)}
<div id="status"></div>
<section><h2>Write</h2>
<form id="post"><textarea class="write" name="text" required placeholder="What do you want to say?"></textarea>
<label>A picture (optional, JPEG)</label><input name="picture" type="file" accept=".jpg,.jpeg,image/jpeg">
<p class="small">Before it leaves, the picture is stripped to the picture alone: no location, camera data or previews.</p>
<label>To an identity (optional): its ID</label><input name="to" autocomplete="off" spellcheck="false" placeholder="64 characters; spaces do not matter">
<p class="small">A public message: the post names that identity and is also left in its inbox, unsealed, so anyone may read it. To report a bug or an attack on MOR, write to the reporting identity named on dubsar.org\u2019s report page.</p>
<div class="row"><button type="submit">Post</button></div></form></section>
<section><h2>Published</h2><div id="published"><p class="small">Your post appears here, read back from the relays and verified.</p></div></section>
<section><h2>Your posts, newest first</h2><div class="row"><button class="quiet" data-action="posts">Look again</button></div><div id="posts"></div></section>
<section><h2>This identity</h2><div class="card" id="identity">${identity(s, web)}</div></section>
${tail}`;
}
function carry(c) {
  return `<div class="card"><p class="id">${e(c.grouped)}</p>
<ul class="say">${c.say.map((s) => `<li>${e(s)}</li>`).join("")}</ul>
<div class="words" id="carry-words">${c.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>
<div class="row"><button class="quiet" data-action="hide-carry">Hide them</button></div></div>`;
}
function identity(s, web = false) {
  const i = s.identity;
  const made = {
    held: "Here. Its chain key is held here too, in software, as test identities hold it.",
    shown: "Here, in this browser. Its chain key was shown once as words, and is kept nowhere here.",
    elsewhere: "Elsewhere, and brought here by its words. Its chain key is not here."
  }[i.chainKey];
  return `<p class="id">${e(i.grouped)}<button class="quiet copy" data-action="copy" data-id="${e(i.id)}">Copy ID</button></p>
<dl class="facts"><dt>Made</dt><dd>${e(made)}</dd>${web ? `<dt>Kept</dt><dd>${e(KEPT_SAY)}</dd>` : ""}
<dt>Homes</dt><dd>${e(i.homes.join(", "))}</dd>
<dt>Relays</dt><dd>${e(i.relays.join(", "))}</dd>
<dt>This app's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? "" : "s"}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? "")}</code>` : ""}</dd></dl>
<p class="small">This app keeps its own line of acts. If the signing key is ever changed, that change must keep this line, or the posts made here become void: take the line above to the device that changes it.</p>`;
}
function shown(p) {
  return `<div data-post="${e(p.id)}">${p.html}${p.withdrawable.map((w) => `<div class="row"><button class="quiet" data-action="withdraw" data-publication="${e(w)}">Withdraw this picture</button><span class="small">Readers stop showing it; the post stands.</span></div>`).join("")}</div>`;
}

// src/page/ui.ts
function mount(app2, b) {
  const $ = (id) => document.getElementById(id);
  function say(kind, html, where) {
    const s = where ?? $("status");
    if (s) s.innerHTML = html ? note(kind, html) : "";
    if (html) s?.scrollIntoView({ block: "nearest" });
  }
  function fail(err, where) {
    if (b.unpaired?.(err)) {
      void b.start();
      return;
    }
    say("error", e(err instanceof Error ? err.message : String(err)), where);
  }
  const fill = (id, html) => {
    const el = $(id);
    if (el) el.innerHTML = html;
  };
  async function busy(words3, f, where) {
    say("", `<span class="small">${e(words3)}</span>`, where);
    const was = [...app2.querySelectorAll("button")].map((x) => [x, x.disabled]);
    app2.querySelectorAll("button").forEach((x) => x.disabled = true);
    try {
      return await f();
    } catch (err) {
      fail(err, where);
      return void 0;
    } finally {
      for (const [x, d] of was) x.disabled = d;
    }
  }
  async function line() {
    try {
      fill("identity", identity(await b.ask("state"), b.web));
    } catch (err) {
      fail(err);
    }
  }
  async function posts() {
    fill("posts", '<p class="small">Reading your posts from the relays\u2026</p>');
    try {
      const ps = await b.ask("posts");
      fill("posts", ps.length ? ps.map(shown).join("") : '<p class="small">No post yet.</p>');
    } catch (err) {
      fill("posts", note("error", e(err instanceof Error ? err.message : String(err))));
    }
  }
  async function copy(text2) {
    try {
      await navigator.clipboard.writeText(text2);
      return true;
    } catch {
      return false;
    }
  }
  app2.addEventListener("click", async (ev) => {
    const el = ev.target.closest("[data-action]");
    if (!el || el instanceof HTMLInputElement) return;
    const d = el.dataset;
    switch (d.action) {
      case "abandon":
        if (!confirm("Forget this new identity? Nothing of it was published. A new one will show new words.")) break;
        try {
          await b.ask("abandon");
          await b.start();
        } catch (err) {
          fail(err);
        }
        break;
      case "posts":
        await posts();
        break;
      case "withdraw": {
        if (!confirm("Withdraw this picture? Readers stop showing it; the post stays. It cannot be undone.")) break;
        const r = await busy("Withdrawing\u2026", () => b.ask("withdraw", { publication: d.publication }));
        if (r) {
          say("done", `The picture is withdrawn (act <code>${e(r.id.slice(0, 16))}\u2026</code>).`);
          const pub = $("published")?.querySelector("[data-post]")?.getAttribute("data-post");
          await line();
          await posts();
          if (pub) fill("published", '<p class="small">The post above was changed: see it in the list below.</p>');
        }
        break;
      }
      case "copy": {
        const ok = await copy(d.id ?? "");
        el.textContent = ok ? "Copied" : "Copy failed: select the ID";
        setTimeout(() => el.textContent = "Copy ID", 2e3);
        break;
      }
      case "code": {
        const r = await busy("Making a code\u2026", () => b.ask("code"));
        if (r) {
          say("", "");
          fill("code", note("", `Code for another browser, valid ten minutes, once: <span class="code">${e(r.code)}</span>`));
        }
        break;
      }
      case "unpair":
        if (!confirm("Unpair this browser? It will need a new link from the app.")) break;
        try {
          await b.unpair?.();
          await b.start();
        } catch (err) {
          fail(err);
        }
        break;
      case "carry": {
        const r = await busy("Reading the identity\u2026", () => b.ask("carry"));
        if (r) {
          say("", "");
          fill("carry", carry(r));
        }
        break;
      }
      case "hide-carry":
        fill("carry", "");
        break;
      case "forget":
        if (!confirm("Forget this identity in this browser? Its signing key goes with it. Only its carry words, written down, bring it back. Its posts stay published.")) break;
        try {
          await b.forget?.();
          await b.start();
        } catch (err) {
          fail(err);
        }
        break;
    }
  });
  const words2 = (s) => typeof s === "string" ? s.trim() : "";
  const linesOf2 = (s) => words2(s).split(/\s+/).filter(Boolean);
  const viaOf = (s) => words2(s).split("\n").map((x) => x.trim()).filter(Boolean);
  function base642(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ""));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }
  app2.addEventListener("submit", async (ev) => {
    const form = ev.target;
    const name = form.getAttribute("id");
    if (name === "pair") return;
    ev.preventDefault();
    const d = new FormData(form);
    switch (name) {
      case "begin": {
        const r = await busy(
          b.web ? "Asking each home who runs it, and making the identity in this browser\u2026" : "Asking each home who runs it, and making the identity\u2026",
          () => b.ask("begin", { homes: linesOf2(d.get("homes")), relays: linesOf2(d.get("relays")), via: viaOf(d.get("via")) })
        );
        if (r) app2.innerHTML = words(r.words, r.positions, r.say, b.web);
        return;
      }
      case "confirm": {
        const typed = [...form.querySelectorAll("input")].map((i) => i.value);
        const r = await busy("Checking the words, then sending the genesis to the homes\u2026", () => b.ask("confirm", { typed }));
        if (r) {
          await b.start();
          say("done", `<strong>The identity is born.</strong>${lines(r.lines)}`);
        }
        return;
      }
      case "bring": {
        const r = await busy(
          "Reading the identity from its homes\u2026",
          () => b.ask("bring", {
            id: words2(d.get("id")),
            words: words2(d.get("words")),
            address: words2(d.get("address")),
            relays: linesOf2(d.get("relays")),
            via: viaOf(d.get("via"))
          })
        );
        if (r) {
          await b.start();
          say("done", `<strong>The identity is here.</strong>${lines(r.lines)}`);
        }
        return;
      }
      case "post": {
        const file = form.elements.namedItem("picture").files?.[0];
        const r = await busy(
          file ? "Stripping the picture, publishing, and reading it back\u2026" : "Publishing, and reading it back\u2026",
          async () => b.ask("post", { text: String(d.get("text") ?? ""), jpeg: file ? await base642(file) : "", to: String(d.get("to") ?? "") })
        );
        if (r) {
          form.reset();
          say("done", `<strong>Posted.</strong>${lines(r.lines)}`);
          fill("published", `<div class="published">${shown(r.post)}</div>`);
          await line();
          await posts();
        }
        return;
      }
    }
  });
  return {
    async show(state, suggested2) {
      if (state.stage === "doors") app2.innerHTML = doors(b.web, suggested2);
      else if (state.stage === "confirm") app2.innerHTML = typeBack(state.confirm.positions, true, b.web);
      else {
        app2.innerHTML = ready(state, b.web);
        await posts();
      }
    }
  };
}

// src/web/keep.ts
var DB = "dub";
var STORE = "keep";
var LOCK = "dub-signing";
function request(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
var WebKeep = class _WebKeep {
  constructor(db) {
    this.db = db;
  }
  waiting = null;
  static async open() {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    return new _WebKeep(await request(r));
  }
  async get(key) {
    return request(this.db.transaction(STORE).objectStore(STORE).get(key));
  }
  async put(key, value) {
    const t = this.db.transaction(STORE, "readwrite");
    t.objectStore(STORE).put(value, key);
    await new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("the browser refused to keep it"));
    });
  }
  async identity() {
    const f = await this.get("identity");
    if (!f) return null;
    if (f.label !== TEST_LABEL) throw new Error("What this browser keeps is not a MOR test identity.");
    return new TestIdentity(f);
  }
  async saveIdentity(id) {
    if (id.f.safety.seeds) throw new Error("A chain key is never kept in this browser.");
    await this.put("identity", JSON.parse(JSON.stringify(id.f)));
  }
  async settings() {
    return await this.get("settings") ?? { kind: "made", relays: [], via: {} };
  }
  async saveSettings(s) {
    await this.put("settings", { kind: s.kind, relays: s.relays, via: {} });
  }
  async pending() {
    return this.waiting;
  }
  async savePending(p) {
    this.waiting = p;
  }
  async dropPending() {
    this.waiting = null;
  }
  /** Forget the identity in this browser: its signing key and its line. Only its carry words, if written down, bring it back. */
  async forget() {
    await this.exclusive(async () => {
      const t = this.db.transaction(STORE, "readwrite");
      t.objectStore(STORE).clear();
      await new Promise((resolve, reject) => {
        t.oncomplete = () => resolve();
        t.onerror = () => reject(t.error);
      });
    });
  }
  /**
   * One signer at a time across every tab of this site: two tabs signing at
   * once would put two acts at one position of the line. Each signer reads
   * the identity afresh inside the lock (`Dub` does).
   */
  exclusive(f) {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f);
  }
};

// src/web/app.ts
var app = document.getElementById("app");
var keep;
var dub;
var text = (x) => typeof x === "string" ? x : "";
var list2 = (x) => Array.isArray(x) ? x.map(String) : [];
var bytes = (b642) => Uint8Array.from(atob(b642), (ch) => ch.charCodeAt(0));
async function ask(op, a = {}) {
  switch (op) {
    case "state":
      return await dub.state();
    case "begin":
      return await dub.begin({ homes: list2(a.homes), relays: list2(a.relays) });
    case "confirm":
      return await dub.confirm(list2(a.typed));
    case "abandon":
      return await dub.abandon();
    case "bring":
      return await dub.bring({ id: text(a.id), words: text(a.words), address: text(a.address), relays: list2(a.relays) });
    case "post":
      return await dub.post({ text: text(a.text), jpeg: text(a.jpeg) ? bytes(text(a.jpeg)) : void 0, to: text(a.to) });
    case "posts":
      return await dub.posts();
    case "withdraw":
      return await dub.withdraw(text(a.publication));
    case "carry":
      return await dub.carry();
    default:
      throw new Error(`unknown operation ${op}`);
  }
}
async function suggested() {
  try {
    const r = await fetch("dub.json", { cache: "no-store" });
    if (!r.ok) return {};
    const j = await r.json();
    const urls = (x) => list2(x).filter((s) => /^https:\/\/[^\s]+$/.test(s));
    return { homes: urls(j.homes), relays: urls(j.relays) };
  } catch {
    return {};
  }
}
var ui = mount(app, {
  web: true,
  ask,
  start,
  forget: () => keep.forget()
});
async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = `${top(true)}${note("error", "This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.")}`;
    return;
  }
  try {
    keep ??= await WebKeep.open();
  } catch (err) {
    app.innerHTML = `${top(true)}${note("error", `This browser does not let the page keep anything (${e(err instanceof Error ? err.message : String(err))}). A private window may not.`)}`;
    return;
  }
  dub ??= new Dub(keep, { web: true });
  let state;
  try {
    state = await dub.state();
  } catch (err) {
    app.innerHTML = `${top(true)}${note("error", e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  await ui.show(state, state.stage === "doors" ? await suggested() : void 0);
}
void start();
