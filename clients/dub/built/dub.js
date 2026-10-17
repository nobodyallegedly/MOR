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
  agreementsDeclared(specs, identity, binding) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
  agreementsSplitTurns(specs, service, agreement, stake, holders2, previous) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(holders2, wasm.__wbindgen_malloc);
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
  succession(identity) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_succession(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
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
function agreementsClonePlan(parent, clone, specs) {
  const ptr0 = passArray8ToWasm0(parent, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(clone, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.agreementsClonePlan(ptr0, len0, ptr1, len1, specs);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
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
function chainKeyFromSeeds(scheme, seeds) {
  const ptr0 = passArray8ToWasm0(seeds, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.chainKeyFromSeeds(scheme, ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
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
function openSealed(bytes, me, secret) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
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
function readTerms(payload, specs) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readTerms(ptr0, len0, specs);
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
function sealedParts(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.sealedParts(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function shareOnPaper(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.shareOnPaper(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function signaturePayload(signed) {
  const ptr0 = passStringToWasm0(signed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.signaturePayload(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
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
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message4 = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message4);
  throw new RangeError(message4);
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
  const hashC = (msg2, opts) => hashCons(opts).update(msg2).digest();
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
    const { A: A2, B, C, D, E, F, G, H } = this;
    return [A2, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A2, B, C, D, E, F, G, H) {
    this.A = A2 | 0;
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
    let { A: A2, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A2, 2) ^ rotr(A2, 13) ^ rotr(A2, 22);
      const T2 = sigma0 + Maj(A2, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A2;
      A2 = T1 + T2 | 0;
    }
    A2 = A2 + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A2, B, C, D, E, F, G, H);
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
var sealedId = (bytes) => {
  const t = unhex(sha2562("MOR/transport/sealed"));
  const all = new Uint8Array(64 + bytes.length);
  all.set(t, 0);
  all.set(t, 32);
  all.set(bytes, 64);
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
  const shown = [];
  for (const l of lines2) {
    const card = cards.find((c) => c.act === l.tip) ?? l.card;
    if (leaveOut.has(l.tip)) {
      left.push(l);
      shown.push({ text: `${lineWords(l)} Left out by name: its acts become void.`, tone: "bad" });
    } else if (card) {
      kept.push(card);
      shown.push({ text: l.readable ? `${lineWords(l)} Kept.` : `${lineWords(l)} Kept by the card given: position ${card.position}, summary ${card.summary}.`, tone: l.readable ? "ok" : "warn" });
    } else {
      left.push(l);
      shown.push({ text: `${lineWords(l)} No card was given, so it is left out: its acts become void.`, tone: "bad" });
    }
  }
  for (const c of cards) {
    if (lines2.some((l) => l.tip === c.act)) continue;
    kept.push(c);
    shown.push({ text: `A line ending at ${c.act}, not found at the identity's homes or relays: kept by the card given (position ${c.position}, summary ${c.summary}).`, tone: "warn" });
  }
  return { kept, left, shown, warning: left.length ? voidWarning(left) : null };
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
    /** The digest's bytes, or, as Node gives it with "hex", its hexadecimal text (the repo client's spec hashes). */
    digest(encoding) {
      const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
      let at = 0;
      for (const p of parts) {
        all.set(p, at);
        at += p.length;
      }
      const d = sha256(all);
      if (encoding === void 0) return d;
      if (encoding !== "hex") throw new Error(`${encoding}: only hex in the browser`);
      return [...d].map((b) => b.toString(16).padStart(2, "0")).join("");
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
async function lookUp(identity, hints, via2 = {}, into) {
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
  const genesis = await firstOf(hints.filter(tryable), (h) => relayAt(h, via2).getAct(identity), failed);
  if (!genesis) throw new Error(`the genesis of ${identity} was not found at ${hints.join(", ")}`);
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
    const r2 = v.resolve(identity);
    return r2.homesAt?.length ? r2.homesAt[r2.homesAt.length - 1] : genesisHomes();
  };
  const record2 = async (h) => {
    const rec = await relayAt(h.hint, via2).identity(identity);
    keep2([...rec.chain, ...rec.receipts, ...rec.routes, ...rec.encryptionKeys, ...rec.evidence, ...rec.otherReceipts]);
    for (const a of rec.links) {
      try {
        const d = describeAct(a);
        if (!d.public && d.signer === identity) v.foundAtHome(d.id, h.operator ?? identity);
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
    const ops = [...new Set(homes.map((h) => h.operator).filter((o) => !!o && o !== identity && !operatorActs.has(o)))];
    await Promise.all(ops.map((op) => operatorChain(op, homes.filter((h) => h.operator === op).map((h) => h.hint))));
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
  const e2 = v.latest(identity, SPECS.envelopes, ENVELOPES_TYPES.encryptionKey);
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
    if (hex(p.get(0)) === identity && v.status(id) === "valid") receipts.push(a);
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
   * pair, or the one `secret` gives (the identity carry Module, draft 2,
   * derives it from the signing seed); the public half in the act, the
   * private half kept in the file.
   */
  async publishEncryptionKey(given) {
    const last = this.f.encryption.at(-1);
    const version = (last?.version ?? 0) + 1;
    const secret = given ?? newEncryptionSecret();
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
    const list5 = [];
    for (let k = 0; k < n; k++) {
      const at = o + 2 + 12 * k;
      list5.push({ tag: r16(at), type: r16(at + 2), count: r32(at + 4), at: at + 8 });
    }
    return { list: list5, next: r32(o + 2 + 12 * n) };
  };
  const first = entries(ifd0);
  if (!first) return none2;
  let orientation = null;
  let location = false;
  for (const e2 of first.list) {
    if (e2.tag === 274 && e2.type === 3 && e2.count === 1) orientation = r16(e2.at);
    if (e2.tag === 34853) location = true;
  }
  let thumbnail = false;
  if (first.next > 0 && first.next < t.length) {
    const second = entries(first.next);
    if (second) thumbnail = second.list.some((e2) => e2.tag === 513 || e2.tag === 273);
  }
  return { orientation, location, thumbnail };
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
  const bytes = concat(parts);
  const after = read(bytes);
  if (after.carries.length) throw new Error(`stripping left ${after.carries.join(", ")}`);
  return { bytes, removed: p.carries, picture: after };
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
  const picture = opts.jpeg ? await publishPicture(by, opts.jpeg, opts.relays) : null;
  await carryChain(by, opts.relays);
  const refs = [...picture ? [referenceTo(picture.act)] : [], ...opts.refs ?? []];
  const made = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(opts.text, opts.format ?? null), {
    public: true,
    relays: opts.relays,
    refs: refs.length ? refs : void 0,
    to: opts.to?.length ? opts.to : void 0
  });
  return { id: made.id, act: made.act, picture };
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
  const who2 = [signer];
  if (forId instanceof Uint8Array) who2.push(hex(forId));
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
  const pairs = hints.filter((h) => !cannotReach(h, via2)).flatMap((h) => who2.map((s) => [h, s]));
  return firstOf(pairs, ([h, s]) => search(h, s));
}

// ../site/src/settings.ts
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

// ../site/src/specs.ts
var test3 = (s) => sha2562(s);
var SITE_SPECS = {
  identity: SPECS.identity,
  /** The Envelopes MIR (`ENVELOPES`): a version is a publication. */
  envelopes: SPECS.envelopes,
  /** The Agreements MIR (`AGREEMENTS`): only to tell that a signer is a collective. */
  agreements: test3("LAW, test value until the freeze"),
  /** The website cMIP (cmips/cmip-website-draft-4.md). Draft 3 adds the icon
   * (rule 16a), draft 4 films (rules 4, 6a, 12a); both leave the manifest's
   * format as it was, so the test value stays draft 2's: versions already
   * published still verify. */
  site: test3("website cMIP, draft 2, test value until publication")
};
var SITE_AGREEMENTS_SPECS = { ...MIRS, agreements: SITE_SPECS.agreements };
var NUDGE = test3("nudge cMIP, draft 2, test value until publication");
var NUDGE_TYPES = { terms: 0, nudge: 1, pick: 2 };
var RELEASE_MANIFEST = test3("release manifest cMIP, draft 1, test value until publication");
var PAYMENT_CMIP = test3("payment cMIP, draft 2, test value until publication");

// ../../modules/timestamp/src/stamp.ts
var TIMESTAMP_SPEC = sha2562("timestamp clock Module, draft 1, test value until publication");
var STAMP_TYPE = 1;
var MOST_PER_STAMP = 256;
var NotAStamp = class extends Error {
};
function decodeStamp(payload) {
  let m;
  try {
    m = cborDecode(payload);
  } catch (e2) {
    throw new NotAStamp(`not CBOR (${e2 instanceof Error ? e2.message : e2})`);
  }
  if (!(m instanceof Map)) throw new NotAStamp("not a map");
  for (const k of m.keys()) if (k !== 0 && k !== 1) throw new NotAStamp(`${String(k)} is not one of its fields`);
  const time = m.get(0);
  if (typeof time !== "number" || !Number.isSafeInteger(time) || time < 0) throw new NotAStamp("its time (field 0) is not a whole number of seconds");
  const list5 = m.get(1);
  if (!Array.isArray(list5) || !list5.length) throw new NotAStamp("its acts (field 1) are not a list of at least one");
  if (list5.length > MOST_PER_STAMP) throw new NotAStamp(`it names more than ${MOST_PER_STAMP} acts`);
  const acts = list5.map((x, i) => {
    if (!(x instanceof Uint8Array) || x.length !== 32) throw new NotAStamp(`its act ${i + 1} is not an act id`);
    return hex(x);
  });
  if (new Set(acts).size !== acts.length) throw new NotAStamp("it names an act twice");
  return { time, acts };
}

// ../../modules/timestamp/src/read.ts
function asStamp(d, clock) {
  if (!d.public || d.signer !== clock || d.spec !== TIMESTAMP_SPEC || d.type !== STAMP_TYPE || !d.payload) return null;
  try {
    const s = decodeStamp(d.payload);
    return { stamp: d.id, time: s.time, acts: s.acts };
  } catch (e2) {
    if (e2 instanceof NotAStamp) return null;
    throw e2;
  }
}
function earliest(stamps) {
  const out = /* @__PURE__ */ new Map();
  for (const s of stamps) for (const a of s.acts) if (!out.has(a) || s.time < out.get(a)) out.set(a, s.time);
  return out;
}
function earliestByNames(acts, own) {
  const ids = new Set(acts.map((a) => a.id));
  const links = new Map(acts.map((a) => [a.id, a.links.filter((l) => ids.has(l) && l !== a.id)]));
  const out = /* @__PURE__ */ new Map();
  for (const [a, t] of own) if (ids.has(a)) out.set(a, t);
  const work = [...out.keys()];
  while (work.length) {
    const a = work.pop();
    const t = out.get(a);
    for (const n of links.get(a) ?? []) {
      if (!out.has(n) || t < out.get(n)) {
        out.set(n, t);
        work.push(n);
      }
    }
  }
  return out;
}
async function readStamps(clock, places, judge, via2 = {}) {
  const seen = /* @__PURE__ */ new Map();
  for (const h of places) {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via2).feed({ signer: clock, after });
      } catch {
        break;
      }
      for (const it of page.items) {
        if (it.kind !== "act") continue;
        let s = null;
        try {
          s = asStamp(describeAct(it.item), clock);
        } catch {
          continue;
        }
        if (s && !seen.has(s.stamp)) seen.set(s.stamp, { s, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  const verified = [];
  for (const { s, act } of seen.values()) {
    try {
      if (await judge.standing(act, s.stamp, clock) === "valid") verified.push(s);
    } catch {
    }
  }
  return { found: seen.size, verified, earliest: earliest(verified) };
}

// ../site/src/feed.ts
var FEED_LIMIT = 30;
var isPost = (d) => d.public && d.spec === POST_SPECS.text && d.type === TEXT_ACT;
var FeedJudge = class {
  constructor(places, via2) {
    this.places = places;
    this.via = via2;
  }
  v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  looked = /* @__PURE__ */ new Map();
  held = /* @__PURE__ */ new Map();
  /** The signer's chain and its sequence, held before one of its acts is judged (F298). */
  sequence(identity) {
    let h = this.held.get(identity);
    if (!h) {
      h = this.lookUp(identity).then((l) => holdSequence(this.v, identity, l, this.places, this.via));
      this.held.set(identity, h);
    }
    return h;
  }
  lookUp(identity, places = this.places) {
    let l = this.looked.get(identity);
    if (!l) {
      l = lookUp(identity, places, this.via, this.v);
      this.looked.set(identity, l);
    }
    return l;
  }
  async standing(act, id, signer) {
    await this.sequence(signer);
    this.v.add(act);
    return this.v.status(id);
  }
};
function placesFor(l, relays, scope = POST_SPECS.text) {
  const outbox = (l?.routes.routes ?? []).filter((r) => (r.kind ?? 0) === 0);
  const route = outbox.find((r) => r.scope === scope) ?? outbox.find((r) => r.scope === null);
  const asked = [];
  const unreachable = [];
  for (const h of route?.hints ?? []) {
    const a = relayAddress(h);
    if (a) {
      if (!asked.includes(a)) asked.push(a);
    } else if (!unreachable.includes(h)) unreachable.push(h);
  }
  for (const r of relays) if (!asked.includes(r)) asked.push(r);
  return { asked, unreachable };
}
async function actsBy2(signer, places, via2, into) {
  for (const h of places) {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via2).feed({ signer, after });
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
        if (d.signer !== signer || into.has(d.id)) continue;
        into.set(d.id, { d, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
}
var linksOf = (d) => [
  ...d.prev ? [d.prev] : [],
  ...d.refs ?? [],
  ...(d.objects ?? []).flatMap(([chain, pred]) => [chain, pred]),
  ...d.acks ?? []
];
function signedOrder(acts, rank, times) {
  const ids = new Set(acts.map((d) => d.id));
  const byId = new Map(acts.map((d) => [d.id, d]));
  const waiting = new Map(acts.map((d) => [d.id, 0]));
  for (const d of acts) for (const n of new Set(linksOf(d))) if (ids.has(n) && n !== d.id) waiting.set(n, waiting.get(n) + 1);
  const key = (d) => [rank(d.signer), -(d.position ?? 0), d.id];
  const byTime = (a, b) => {
    if (!times) return 0;
    const [x, y] = [times.get(a.id), times.get(b.id)];
    if (x === void 0 || y === void 0) return x === y ? 0 : x === void 0 ? -1 : 1;
    return y - x;
  };
  const before = (a, b) => {
    const [x, y] = [key(a), key(b)];
    return byTime(a, b) || x[0] - y[0] || x[1] - y[1] || (x[2] < y[2] ? -1 : 1);
  };
  const free = acts.filter((d) => waiting.get(d.id) === 0);
  const out = [];
  while (free.length) {
    free.sort(before);
    const d = free.shift();
    out.push(d.id);
    for (const n of new Set(linksOf(d))) {
      if (!ids.has(n) || n === d.id) continue;
      const left = waiting.get(n) - 1;
      waiting.set(n, left);
      if (left === 0) free.push(byId.get(n));
    }
  }
  for (const d of acts.filter((x) => !out.includes(x.id)).sort(before)) out.push(d.id);
  return out.filter((id) => isPost(byId.get(id)));
}
async function readOne(id, signer, position, places, via2, judge, lookupProblem) {
  const p = { id, signer, position, post: null, problem: null, answers: [] };
  if (lookupProblem) {
    p.problem = `its signer's identity chain could not be looked up: ${lookupProblem}`;
    return p;
  }
  try {
    p.post = await readPost(id, places, via2, judge);
    if (p.post.standing !== "valid") p.problem = `its standing is \u201C${p.post.standing}\u201D, not valid`;
  } catch (err) {
    p.problem = err instanceof Error ? err.message : String(err);
  }
  return p;
}
async function causeOf(id, agent, named, places, via2, judge, found) {
  let act = found.get(id)?.act ?? null;
  for (const h of act ? [] : places) {
    try {
      act = await relayAt(h, via2).getAct(id);
      if (act) break;
    } catch {
    }
  }
  if (!act) return null;
  let d;
  try {
    d = describeAct(act);
  } catch {
    return null;
  }
  if (d.id !== id || !d.public || !d.payload || !d.signer || d.spec !== NUDGE) return null;
  if (d.type !== NUDGE_TYPES.pick && d.type !== NUDGE_TYPES.nudge) return null;
  if (!named.has(d.signer)) return null;
  let m;
  try {
    m = cborDecode(d.payload);
  } catch {
    return null;
  }
  const f0 = m.get(0);
  if (!(f0 instanceof Uint8Array) || hex(f0) !== agent) return null;
  const f2 = m.get(2);
  const picked = d.type === NUDGE_TYPES.pick ? f2 instanceof Uint8Array ? hex(f2) : null : null;
  if (d.type === NUDGE_TYPES.pick && !picked) return null;
  if (d.type === NUDGE_TYPES.nudge && !(typeof f2 === "number" && f2 >= 1)) return null;
  if (await judge.standing(act, id, d.signer) !== "valid") return null;
  return { type: d.type, signer: d.signer, picked };
}
var message = (err) => err instanceof Error ? err.message : String(err);
async function readFeed(authors, relays, via2 = {}, limit = FEED_LIMIT, clock = null) {
  const judge = new FeedJudge(relays, via2);
  const lines2 = [];
  const found = /* @__PURE__ */ new Map();
  const placesOf = /* @__PURE__ */ new Map();
  const problems = /* @__PURE__ */ new Map();
  await Promise.all(
    authors.map(async (a) => {
      let l = null;
      let problem = null;
      try {
        l = await judge.lookUp(a.identity);
      } catch (err) {
        problem = message(err);
      }
      const { asked, unreachable } = placesFor(l, relays);
      lines2.push({ ...a, asked, unreachable, problem, found: 0, verified: 0 });
      placesOf.set(a.identity, asked);
      if (problem) problems.set(a.identity, problem);
    })
  );
  lines2.sort((x, y) => authors.findIndex((a) => a.identity === x.identity) - authors.findIndex((a) => a.identity === y.identity));
  for (const a of authors) await actsBy2(a.identity, placesOf.get(a.identity), via2, found);
  let clockLine = null;
  let times;
  if (clock) {
    let l = null;
    let problem = null;
    try {
      l = await judge.lookUp(clock.identity);
    } catch (err) {
      problem = message(err);
    }
    const { asked, unreachable } = placesFor(l, relays, TIMESTAMP_SPEC);
    clockLine = { ...clock, asked, unreachable, problem, found: 0, verified: 0, placed: 0 };
    if (!problem) {
      const read2 = await readStamps(clock.identity, asked, judge, via2);
      clockLine.found = read2.found;
      clockLine.verified = read2.verified.length;
      times = earliestByNames([...found.values()].map((x) => ({ id: x.d.id, links: linksOf(x.d) })), read2.earliest);
    }
  }
  const rank = (s) => authors.findIndex((a) => a.identity === s);
  const all = [...found.values()].map((x) => x.d);
  const placed = times ? all.filter((d) => isPost(d) && times.has(d.id)).length : 0;
  if (clockLine) clockLine.placed = placed;
  const byClock = placed > 0;
  const order = signedOrder(all, rank, byClock ? times : void 0);
  const shown = order.slice(0, limit);
  const posts = await Promise.all(
    shown.map(async (id) => {
      const { d } = found.get(id);
      const p = await readOne(id, d.signer, d.position ?? null, placesOf.get(d.signer), via2, judge, problems.get(d.signer) ?? null);
      if (byClock) p.time = times.get(id) ?? null;
      return p;
    })
  );
  const answered = /* @__PURE__ */ new Map();
  const byId = new Map(posts.map((p) => [p.id, p]));
  const everywhere = [...new Set([...placesOf.values()].flat())];
  const named = new Set(authors.map((a) => a.identity));
  for (const p of posts) {
    if (!p.post || p.problem) continue;
    for (const ref of p.post.refs) {
      if (ref.kind !== "act") continue;
      const r = ref.id;
      if (answered.has(r)) {
        p.answers.push(r);
        continue;
      }
      const inFeed = byId.get(r);
      if (inFeed) {
        answered.set(r, inFeed);
        p.answers.push(r);
        continue;
      }
      let d = found.get(r)?.d ?? null;
      for (const h of d ? [] : everywhere) {
        try {
          const act = await relayAt(h, via2).getAct(r);
          if (act) {
            d = describeAct(act);
            if (d.id !== r) d = null;
            if (d) break;
          }
        } catch {
        }
      }
      if (!d) {
        if (ref.what !== "not found at the relays asked") continue;
        answered.set(r, { id: r, signer: "", position: null, post: null, problem: "not found at the places asked", answers: [] });
      } else if (!isPost(d) || !d.signer) {
        continue;
      } else if (!named.has(d.signer) && (d.to ?? []).some((t) => named.has(t))) {
        const n = await readOne(r, d.signer, d.position ?? null, everywhere, via2, judge, null);
        n.note = true;
        answered.set(r, n);
      } else if (!named.has(d.signer)) {
        answered.set(r, { id: r, signer: d.signer, position: d.position ?? null, post: null, problem: null, answers: [] });
      } else {
        answered.set(r, await readOne(r, d.signer, d.position ?? null, everywhere, via2, judge, problems.get(d.signer) ?? null));
      }
      p.answers.push(r);
    }
  }
  for (const p of posts) {
    const notes = p.answers.filter((r) => answered.get(r)?.note);
    if (!notes.length) continue;
    p.picked = new Map(notes.map((r) => [r, null]));
    const causes = p.post.refs.flatMap((x) => x.kind === "act" && !answered.has(x.id) ? [x.id] : []);
    let nudged = false;
    for (const c of causes) {
      const cause = await causeOf(c, p.signer, named, everywhere, via2, judge, found);
      if (cause?.type === NUDGE_TYPES.pick && p.picked.has(cause.picked)) p.picked.set(cause.picked, cause.signer);
      if (cause?.type === NUDGE_TYPES.nudge) nudged = true;
    }
    if (nudged) {
      for (const [r, by] of p.picked) if (by === null) p.picked.set(r, p.signer);
    }
  }
  for (const line of lines2) {
    const mine = posts.filter((p) => p.signer === line.identity);
    line.found = order.filter((id) => found.get(id).d.signer === line.identity).length;
    line.verified = mine.filter((p) => !p.problem).length;
  }
  return { authors: lines2, posts, more: order.length - shown.length, answered, clock: clockLine, order: byClock ? "clock" : "signed" };
}

// ../reader/src/link.ts
function makeLink(page, act, relays = []) {
  const base = page.replace(/#.*$/, "");
  const q = relays.length ? "?" + relays.map((r) => `r=${encodeURIComponent(r)}`).join("&") : "";
  return `${base}#${act}${q}`;
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
var ENCRYPTION_TAG = "MOR/module/carry/encryption";
function encryptionSecret(signingSeed) {
  if (signingSeed.length !== 32) throw new Refused("a signing seed is 32 bytes");
  const t = createHash("sha256").update(ENCRYPTION_TAG).digest();
  return new Uint8Array(createHash("sha256").update(t).update(t).update(signingSeed).digest());
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

// ../repo/src/specs.ts
var test4 = (s) => createHash("sha256").update(s).digest("hex");
var REPO_SPECS = {
  /** The Agreements MIR (`AGREEMENTS`). */
  agreements: test4("LAW, test value until the freeze"),
  /** The release manifest cMIP (cmips/cmip-release-manifest-draft-1.md). */
  manifest: test4("release manifest cMIP, draft 1, test value until publication"),
  /** The payment cMIP: a Module under it must carry fields 11 and 13 (Development draft 10, F301). The core's test value. */
  payment: test4("payment cMIP, draft 2, test value until publication")
};
var AGREEMENTS_TYPES = {
  terms: 0,
  signature: 1,
  release: 5,
  offer: 6,
  split: 8,
  grant: 9,
  /** Liveness (type 12, rule 50): here, an act of the collective acknowledging what it relies on (F303). */
  liveness: 12,
  declaration: 13,
  /** A contest of a declaration of absence (rule 52; BQ4, F188). */
  contest: 14,
  /** A party's request that a deal's arbitrator settle its fork (DQ8, F188). */
  settlementRequest: 22,
  /** The arbitrator's settlement of a deal's fork (DQ8, F188). */
  forkSettlement: 23,
  /** A notice to a payer owed money back who gave no address (rule 37d; F197). */
  notice: 24,
  resignation: 16,
  record: 17,
  fork: 19,
  closing: 20
  // 21, the creditor's release under F125, is retired: a Money act now (F126).
};
var TEST_RAIL = test4("a test rail Module, no real rail");
var TEST_TIME = test4("a test time reference, no real clock");

// ../repo/src/proposals.ts
var NEGOTIATION = 18;
var SHARE_MEDIA = "f2f9c2b8a6e0c5c1b4a7d1e3f0a9c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1";
var ONE_TIME_LINE = "One-time key for my share of the chain key: ";
var SIGNED = "Signed.";
var DECLINED = "Declined.";
var negotiationPayload = (text2) => cborEncode(/* @__PURE__ */ new Map([[0, text2.normalize("NFC")]]));
async function negotiate(by, to, o) {
  const made = by.sign(REPO_SPECS.agreements, NEGOTIATION, negotiationPayload(o.text), {
    public: false,
    to: [to.id],
    objects: o.thread ? [[o.thread, o.previous ?? o.thread]] : void 0,
    acks: o.acks?.length ? o.acks : void 0,
    refs: o.refs
  });
  const sealed = sealFor(made.act, made.key, [{ id: to.id, key: to.key }]);
  const left = [];
  const failed = [];
  for (const hint of to.inbox) {
    try {
      const r = relayAt(hint, by.via);
      for (const c of by.chainActs()) await r.putAct(c).catch(() => void 0);
      await r.putSealed(sealed);
      left.push(hint);
    } catch (e2) {
      failed.push({ relay: hint, reason: e2 instanceof Error ? e2.message : String(e2) });
    }
  }
  return { id: made.id, act: made.act, key: made.key, sealed: sealedId(sealed), left, failed };
}
function readMessage(d) {
  if (d.spec !== REPO_SPECS.agreements || d.type !== NEGOTIATION || !d.payload || !d.signer) return null;
  const m = cborDecode(d.payload);
  const text2 = m.get(0);
  if (typeof text2 !== "string") return null;
  const link = d.objects?.[0];
  return {
    id: d.id,
    from: d.signer,
    to: d.to ?? [],
    text: text2,
    thread: link ? link[0] : d.id,
    previous: link ? link[1] : null,
    acks: d.acks ?? [],
    refs: (d.refs ?? []).flatMap((r, i) => d.refSigners?.[i] ? [[r, d.refSigners[i]]] : [])
  };
}
function acceptanceText(signature, oneTime) {
  return [SIGNED, `My signature is act ${signature}.`, ...oneTime ? [`${ONE_TIME_LINE}${base64(oneTime)}`] : []].join("\n");
}
async function openShare(secret, relays, senderHints, via2 = {}) {
  const tag = pickupTag(xwingPublic(secret));
  for (const hint of relays) {
    let items = [];
    try {
      items = (await relayAt(hint, via2).feed({ pickup: tag })).items;
    } catch {
      continue;
    }
    for (const it of items) {
      if (it.kind !== "sealed") continue;
      const r = await receive(it.item, null, [secret], senderHints, via2);
      if (!r.opened || !r.act) continue;
      const opened = await openedAct(it.item, secret);
      if (!opened) continue;
      const m = cborDecode(opened.payload);
      if (hex(m.get(0)) !== SHARE_MEDIA) throw new Error("What was sealed to this one-time key is not a share.");
      const lockedHash = hex(m.get(2));
      for (const h of [.../* @__PURE__ */ new Set([...m.get(6) ?? [], ...relays])]) {
        let locked = null;
        try {
          locked = await relayAt(h, via2).getMedia(lockedHash);
        } catch {
          locked = null;
        }
        if (!locked) continue;
        const share2 = openMedia(locked, m.get(5), m.get(4));
        if (workHash(share2) !== hex(m.get(1))) throw new Error("The share does not match its fingerprint.");
        return { share: share2, from: r.from ?? "", status: r.status ?? "unknown" };
      }
      throw new Error("The share was sealed to this key, but its contents were not found at the relays.");
    }
  }
  return null;
}
async function openedAct(sealed, secret) {
  try {
    const o = openSealed(sealed, void 0, secret);
    if (o.described.spec !== SPECS.envelopes || o.described.type !== 0 || !o.described.payload) return null;
    return { payload: o.described.payload };
  } catch {
    return null;
  }
}

// ../repo/src/agreements.ts
var AGREEMENTS_SPECS = { ...MIRS, agreements: REPO_SPECS.agreements, extLayers: { [REPO_SPECS.manifest]: [] } };
async function carryChain2(by, relays) {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
      }
    }
  }
}
async function latestPointerAct(by, relays) {
  const acts = /* @__PURE__ */ new Map();
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  for (const a of by.chainActs()) v.add(a);
  const found = /* @__PURE__ */ new Map();
  for (const h of relays) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, by.via).feed({ signer: by.id, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          try {
            const d = describeAct(it.item);
            if (d.spec !== MIRS.money || d.type !== MONEY_POINTER || !d.payload) continue;
            const m = cborDecode(d.payload);
            const payee = m.get(0);
            if (!(payee instanceof Uint8Array) || hex(payee) !== by.id) continue;
            const id = v.add(it.item);
            if (v.status(id) !== "valid") continue;
            const prev = m.get(2);
            found.set(id, { version: Number(m.get(1)), previous: prev instanceof Uint8Array ? hex(prev) : null });
            acts.set(id, it.item);
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  const firsts = [...found].filter(([, p2]) => p2.version === 1 && p2.previous === null);
  if (firsts.length !== 1) return null;
  let [at, p] = firsts[0];
  for (; ; ) {
    const next = [...found].filter(([, q]) => q.previous === at && q.version === p.version + 1);
    if (next.length !== 1) return { id: at, act: acts.get(at) };
    [at, p] = next[0];
  }
}
var MONEY_POINTER = 0;
async function sign(by, act, relays) {
  await carryChain2(by, relays);
  let refs;
  if (await canPaySigner(act, relays, by.via)) {
    const p = await latestPointerAct(by, relays);
    if (p) refs = [referenceTo(p.act)];
  }
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, signaturePayload(act), {
    public: true,
    relays,
    objects: [[act, act]],
    refs
  });
}
async function canPaySigner(act, relays, via2) {
  for (const h of relays) {
    try {
      const a = await relayAt(h, via2).getAct(act);
      if (!a) continue;
      const d = describeAct(a);
      return d.spec === REPO_SPECS.agreements && (d.type === AGREEMENTS_TYPES.terms || d.type === AGREEMENTS_TYPES.offer);
    } catch {
    }
  }
  return false;
}

// ../collective/src/explain.ts
var short = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
var count = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
function termsOf(payload) {
  return readTerms(payload, AGREEMENTS_SPECS);
}
var KNOWN = {
  [SPECS.identity]: "the Identity MIR",
  [SPECS.envelopes]: "the Envelopes MIR",
  [SPECS.text]: "the Text MIR",
  [MIRS.money]: "the Money MIR",
  [MIRS.development]: "the Development MIR",
  [REPO_SPECS.agreements]: "the Agreements MIR",
  [REPO_SPECS.manifest]: "the release manifest cMIP (draft 1)"
};
var EXTENSIONS = /* @__PURE__ */ new Set([REPO_SPECS.manifest]);
var ABSENCE_PROOFS = /* @__PURE__ */ new Set();
var specName = (h) => KNOWN[h] ?? `an unknown specification (${short(h)})`;
function list(xs) {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}
function ruleWords(r, parties, names) {
  switch (r.form) {
    case "all":
      return parties.length === 1 ? "the one party" : `all ${parties.length} parties`;
    case "threshold":
      return `any ${r.threshold} of the ${parties.length} parties`;
    case "named":
      return list((r.named ?? []).map(names));
    case "share":
      return `parties holding together at least ${pct(r.share)} of what the voices that remain hold of stake ${r.stake}`;
    case "holders":
      return `holders of stake ${r.stake} holding together at least ${pct(r.share)} of it, members or not`;
    case "allOf":
      return `all of: ${(r.rules ?? []).map((x) => ruleWords(x, parties, names)).join("; ")}`;
  }
}
function ownersWithoutKeys(t, names) {
  const parts = (r) => !r ? [] : r.form === "allOf" ? (r.rules ?? []).flatMap(parts) : [r];
  const among = parts(t.constitutional).filter((r) => r.form === "holders");
  if (!among.length || !t.grammar) return [];
  const k = t.grammar.chainKey;
  const keyed = /* @__PURE__ */ new Set([...k.members ?? [], ...k.holder ? [k.holder] : [], ...k.custodian ? [k.custodian] : [], ...t.grammar.recovery?.custodian ? [t.grammar.recovery.custodian] : []]);
  const out = [];
  for (const r of among) {
    const holders2 = (t.stakes[r.stake ?? 0]?.[1] ?? []).map(([h]) => h).filter((h) => !!h && !t.parties.includes(h));
    if (holders2.some((h) => keyed.has(h))) continue;
    out.push({
      text: `The constitution counts members among the holders of stake ${r.stake}, but none of them who is no member${holders2.length ? ` (${list(holders2.map(names))})` : ""} holds a share of the chain key or is its custodian: if the owners vote the members out and the members refuse to rotate, the vote stands complete and unexecuted, and the collective runs on under the old members (Agreements draft 14, F317, a stated cost; client conformance).`,
      tone: "warn"
    });
  }
  return out;
}
function pct(n) {
  return `${(n ?? 0) / 1e4}%`;
}
function constitutionWords(t, names) {
  const r = t.constitutional;
  if (!r || r.form === "all") return "every member whose voice remains: nobody loses their say without signing (F103)";
  if (r.form === "threshold") return `any ${r.threshold} of the ${t.parties.length} members (all of those whose voice remains, if fewer remain)`;
  if (r.form === "named") return list((r.named ?? []).map(names));
  return ruleWords(r, t.parties, names);
}
function powerWords(p, areas, names) {
  switch (p.form) {
    case "constitutional":
      return "the constitutional change rule";
    case "clone":
      return "the clone rule";
    case "area": {
      const a = areas.find((x) => x.id === p.area);
      return a ? `the power of the \u201C${a.name}\u201D area (area ${p.area})` : `the power of area ${p.area}`;
    }
    case "plan":
      return `the succession plan of ${names(p.party ?? "")}`;
    case "judicial":
      return "the judicial tier's rule, every member whose voice remains";
  }
}
var LAYERS = ["Identity", "Envelopes and Text", "Money", "Agreements", "Development"];
var TYPE_NAMES = {
  [SPECS.envelopes]: { 0: "every publication of the collective (a release is one)", 1: "every key delivery of the collective", 4: "every encryption key of the collective" },
  [REPO_SPECS.agreements]: { 0: "every terms act of the collective", 1: "every signature of the collective" },
  [SPECS.text]: { 0: "every text of the collective" }
};
function kindWords(k) {
  if (k.form === "layer") {
    const layer = LAYERS[k.layer ?? -1] ?? `layer ${k.layer}`;
    return `every act of the ${layer} layer: its lane, which also adopts the cMIPs for that layer's tasks`;
  }
  return TYPE_NAMES[k.spec ?? ""]?.[k.type ?? -1] ?? `every act of type ${k.type} of ${specName(k.spec ?? "")} made by the collective`;
}
var OPERATIONAL_FIELDS = { 7: "the stakes", 8: "the split plan", 17: "the refund terms", 28: "the fees" };
function fieldRefWords(f) {
  return f.form === "field" ? OPERATIONAL_FIELDS[f.number] ?? `field ${f.number}` : `the cMIP for task ${f.number}`;
}
var OUTCOMES = [
  "their voice is removed (they no longer count in any rule or area)",
  "their stake is shared among the remaining holders",
  "their stake is transferred to parties named or defined by role",
  "their obligations are redirected or held",
  "the agreement is closed"
];
var AGREEMENTS_SAYS = {
  check: "Agreements refuse these terms",
  shape: "These are not terms in Agreements' format",
  unsupported: "Agreements do not support these terms yet",
  missing: "Agreements lacks something it needs to judge these terms",
  unsettled: "Agreements cannot settle these terms yet"
};
function problemWords(p) {
  return `${AGREEMENTS_SAYS[p.code] ?? `Agreements refuse these terms (${p.code})`}. Agreements' own words: \u201C${p.text}\u201D.`;
}
var INVISIBLE = /[؜​‎‏‪-‮⁦-⁩]/g;
function uncovered(t) {
  const voices = t.constitutional?.form === "named" ? t.constitutional.named ?? [] : t.parties;
  const a = t.abandonment;
  if (!a || !a.outcomes.includes(0)) return voices;
  if (a.authority === "named") return voices.filter((v) => v === a.identity);
  return [];
}
function absenceWarning(t, names) {
  const a = t.abandonment;
  if (!a) return null;
  const by = a.authority === "named" ? names(a.identity) : `any ${a.threshold} of the other parties together`;
  const outcomes = list(a.outcomes.map((o) => OUTCOMES[o] ?? `outcome ${o}`));
  const between = a.proof ? `An absence-proof cMIP stands between their word and your stake: ${specName(a.proof)}. A declaration counts only if it accepts it (Agreements rule 51).` : `No absence-proof cMIP stands between: their word alone is enough, nobody checks it against time or your activity. Signing accepts that (Agreements rules 49 and 51, a stated cost); if they declare you absent wrongly, you can only contest it, in public (Agreements rule 52).`;
  return {
    text: `If a party stops acting on the agreement, ${by} may declare them absent. What may then follow: ${outcomes}. ${between}`,
    tone: "warn"
  };
}
function readAgreement(t, names, parent) {
  const blocking = [];
  const plain = [];
  const who2 = t.parties.map(names);
  const sections = [];
  const g = t.grammar;
  const bound = [
    { text: `${t.parties.length} parties: ${list(who2)}.` },
    { text: "Each is bound only by their own signature act. Until someone signs, nothing in it binds them (Agreements rule 1)." }
  ];
  if (!t.parent) {
    if (t.signing?.form === "all") {
      bound.push({
        text: g ? "It exists only once every one of them has signed it: nobody is founded into a collective without signing (Agreements, \u201CFounding terms\u201D, Q11)." : "It exists only once every one of them has signed it (Agreements, \u201CFounding terms\u201D, F107)."
      });
    } else if (t.signing) {
      bound.push({ text: `It says it exists once ${ruleWords(t.signing, t.parties, names)} have signed it; Agreements asks for every party.`, tone: "bad" });
    }
  } else {
    bound.push({ text: `It is a clone of agreement ${short(t.parent)}: once in force, it replaces it, and that one closes (Agreements rule 45).` });
  }
  sections.push({ heading: "Who is bound", lines: bound });
  if (t.parent) {
    const areas = parent?.areas ?? t.areas;
    const lines2 = [];
    if (!t.mark?.length) lines2.push({ text: "It carries no mark: it does not say by which power it comes in.", tone: "bad" });
    const order = (ids) => {
      const at = (x) => t.parties.indexOf(x) + 1 || Infinity;
      return [...ids].sort((x, y) => at(x) - at(y));
    };
    for (const e2 of t.mark ?? []) {
      lines2.push({ text: `It says it comes in by ${powerWords(e2.power, areas, names)} of that agreement, signed by ${list(order(e2.signers).map(names))}.` });
    }
    lines2.push({
      text: "Agreements check that these are exactly the powers its changes need, and that those named meet them, counted among the voices that remain. A false mark sinks the clone, whatever signatures it gathers (F104)."
    });
    lines2.push({ text: "It is complete once everyone its mark names, and everyone it adds, has signed it (Agreements rule 45)." });
    if (g) {
      lines2.push({
        text: "A change of the constitution is then put in force by a rotation of the collective; any other change by the collective's record, at once, with its signing key (Agreements rules 37, 37c)."
      });
    }
    sections.push({ heading: "How it comes into force: its mark", lines: lines2 });
  }
  if (g) {
    const lines2 = [{ text: "It founds a collective: an identity of its own, whose keys its members hold as follows (Agreements rule 36)." }];
    const s = g.signing;
    if (s.form === "one") {
      lines2.push({
        text: `${names(s.holder)} holds the collective's signing key, and signs the collective's acts with it. An act no area reaches needs nobody else's signature.`
      });
    } else if (s.form === "shares") {
      lines2.push({ text: `The signing key is held jointly: any ${s.threshold} of ${list((s.members ?? []).map(names))} sign together.` });
    } else {
      lines2.push({ text: `${names(s.custodian)} holds the signing key as custodian, under grant ${short(s.grant)}.` });
    }
    const k = g.chainKey;
    if (k.form === "shares") {
      const m = k.members ?? [];
      lines2.push({
        text: `The chain key, the one that rotates the collective (new keys, new members, new homes), is cut into ${m.length} shares, one each for ${list(m.map(names))}. Any ${k.threshold} of them together rebuild it.`
      });
      if (k.threshold === 1) {
        lines2.push({ text: "Any one member alone can rebuild the chain key and rotate the collective, without the others.", tone: "warn" });
      } else if (k.threshold < m.length) {
        lines2.push({ text: `If one member is lost, the other ${m.length - 1} can still rotate the collective (F96).`, tone: "ok" });
      }
    } else if (k.form === "one") {
      lines2.push({ text: `${names(k.holder)} alone holds the chain key.`, tone: "warn" });
    } else {
      lines2.push({ text: `${names(k.custodian)} holds the chain key as custodian, under grant ${short(k.grant)}.`, tone: "warn" });
    }
    if (g.recovery) {
      const r = g.recovery;
      lines2.push({
        text: r.form === "escrow" ? `A further share is held in escrow, released by ${names(r.authority)}, the authority on absence.` : `A further share is held by ${names(r.custodian)}, as custodian under grant ${short(r.grant)}.`
      });
    }
    sections.push({ heading: "The collective's keys", lines: lines2 });
    const words2 = new Map(t.areaWords);
    const al = [];
    if (!t.areas.length) al.push({ text: "No area: no act of the collective needs members' own signatures; its signing key alone speaks for it.", tone: "warn" });
    for (const a2 of t.areas) {
      al.push(
        a2.holders.length ? { text: `\u201C${a2.name}\u201D (area ${a2.id}): held by ${list(a2.holders.map(names))}; any ${a2.threshold} of them decide together.` } : { text: `\u201C${a2.name}\u201D (area ${a2.id}): held by nobody. It stands frozen until the members refit it (Agreements rule 37b).`, tone: "warn" }
      );
      const reach = [...a2.kinds.map(kindWords), ...a2.fields.map(fieldRefWords)];
      al.push({ text: `It reaches ${list(reach) || "nothing"}.` });
      const releases = a2.kinds.some((k2) => k2.form === "type" && k2.spec === MIRS.envelopes && k2.type === 0);
      al.push({
        text: `${releases ? "A release" : "An act it reaches"} counts only once that many of its holders have signed it, each with a visible act of their own, under the agreement in force when the collective signed it (Agreements rule 36a, F100).`
      });
      const own = words2.get(a2.id);
      if (own !== void 0) {
        al.push({ text: "It has words of its own, shown below; its holders change them alone." });
        plain.push({ heading: `The \u201C${a2.name}\u201D area's own words`, text: own });
      }
    }
    if (t.areas.length) {
      al.push({ text: "In an area, its holders alone decide, and may grant within it (Q5). Its holders, and how many of them decide, change only by the constitutional change rule." });
      al.push({
        text: "A holder may step down at once, alone. The other holders carry on: their number stands while enough of them remain, and all of them together meet it when fewer do (Agreements rule 44d). With no holder left, the area is frozen: its acts count for nothing until the members refit it (Agreements rule 37b)."
      });
      al.push({ text: "An act no area reaches counts on the collective's own signature; an act of a specification this agreement names nowhere counts for nothing (Q16)." });
    }
    sections.push({ heading: "Areas: who decides which acts", lines: al });
    const clone = ruleWords(t.clone, t.parties, names);
    sections.push({
      heading: "Who decides what",
      lines: [
        {
          text: `Constitutional: the members, the change rules, the key grammar, the areas and the constitution's words. They change only by the constitutional change rule: ${constitutionWords(t, names)}. Such a change is declared by a rotation of the collective to new keys; whatever its old key signs afterwards is void (Agreements rule 37, F100).`
        },
        {
          text: `Judicial: the protected clauses (the abandonment clause, the keepers, the arbitrators, the time reference, the succession plans, the fork rule, and the condition, time reference and anchoring cMIPs). They change only with the signature of every member whose voice remains: one version for everyone (Agreements rule 46a, F121).`
        },
        {
          text: `Operational: matters outside every area change by the clone rule, ${clone}, and are written on the collective's record at once (Agreements rule 37c); matters inside an area, by its holders.`
        },
        { text: "A change touching the constitution needs the constitutional change rule alone, which may change every tier; any other needs the power of each area and tier it touches, all at once (Agreements rule 44c, Q7)." },
        ...ownersWithoutKeys(t, names)
      ]
    });
  }
  sections.push({
    heading: "Changing it",
    lines: [
      {
        text: g ? "It is never edited. It changes only by a clone, a new version naming this one, whose mark names the powers its changes need (Agreements rule 45). A member who joins is bound once they sign it too: nobody is added without signing (Agreements rule 1, Q11)." : "It is never edited. It changes only by a clone, a new version naming this one, that every party signs (Agreements rule 45b, F107)."
      }
    ]
  });
  if (g) {
    sections.push({
      heading: "Leaving",
      lines: [
        { text: "Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own and staying bound by what they signed (Agreements rule 37a)." },
        {
          text: "It takes effect for the collective at the collective's next record, its line, drawn with its signing key. Until then their signature still counts (F109, a stated cost). The members who stay then rotate the collective to keys the one who left never held (Agreements rule 37).",
          tone: "warn"
        }
      ]
    });
  }
  const a = t.abandonment;
  const absence = [];
  const warning = absenceWarning(t, names);
  if (warning) {
    absence.push(warning);
    if (a?.proof && !ABSENCE_PROOFS.has(a.proof)) {
      absence.push({ text: `This client does not implement the absence-proof cMIP the clause names (${short(a.proof)}): it cannot show how absence would be judged.`, tone: "bad" });
      blocking.push(`It names an absence-proof cMIP this client does not implement (${short(a.proof)}, task 14); a client MUST NOT sign terms naming one it does not implement, as for an unknown extension (Agreements, task "Absence proof", F182).`);
    }
    absence.push({ text: "Signing agrees to this in advance (Agreements rule 13). It is a protected clause: a later clone you do not sign cannot change it for you (Agreements rule 46a)." });
    absence.push({ text: "A declaration moves nothing by itself: what follows takes effect only through a record, rotation or clone put in force under it, and no later act undoes that (Agreements rule 51)." });
  } else {
    absence.push({ text: "No abandonment clause: nobody can declare a party absent." });
  }
  if (g) {
    const out = uncovered(t);
    if (!out.length) {
      absence.push({
        text: "Every member with a say in the constitution is covered: if one disappears, their voice can be removed, so the constitution never freezes for want of them (F105).",
        tone: "ok"
      });
    } else {
      absence.push({ text: `Not covered by the abandonment clause, though they have a say in the constitution: ${list(out.map(names))} (Agreements rule 36b, F105).`, tone: "bad" });
    }
  }
  sections.push({ heading: "If someone disappears", lines: absence });
  const more = [];
  if (!t.cmips.length) more.push({ text: "It uses no task cMIP." });
  for (const [task, h] of t.cmips) {
    const known = KNOWN[h];
    more.push({ text: `For task ${task}: ${specName(h)}.`, tone: known ? void 0 : "bad" });
    if (!known) blocking.push(`It names a cMIP this client does not implement (${short(h)}, task ${task}); a client that does not implement it cannot sign it (Agreements rule 2).`);
  }
  for (const h of t.extensions ?? []) {
    if (EXTENSIONS.has(h)) more.push({ text: `It adds the rules of ${specName(h)}.` });
    else {
      more.push({ text: `It adds the rules of ${specName(h)}.`, tone: "bad" });
      blocking.push(`It names an extension this client does not implement (${short(h)}); a client that does not implement all of them cannot sign it (Agreements rule 2).`);
    }
  }
  if (t.keepers) {
    more.push({ text: `Keepers record the deal as it happens: ${list(t.keepers[0].map(names))}; ${ruleWords(t.keepers[1], t.keepers[0], names)} count as recorded. A protected clause (Agreements rule 46a).` });
  }
  if (t.time) {
    more.push({ text: `Time reference: ${specName(t.time)}. This client does not read time references.`, tone: "bad" });
    blocking.push("It names a time reference, which this client does not read: it cannot show what its deadlines mean.");
  }
  if (t.arbitrators) more.push({ text: `Arbitrators or verifiers, who receive keys to judge content: ${list(t.arbitrators.map(names))}.` });
  if (t.splitGrant) {
    more.push({
      text: `Incoming payments go to a split service, under grant ${short(t.splitGrant)}. A protected clause. The collective's payee pointer counts for Agreements only if every address in it is also in the service's own signed pointer (Agreements rule 18, F123); every split is delivered to every holder it pays, naming each fee and who received it (F121, Q9). The service's grant key signs only receipts for money coming in under the collective's own claims and offers: never one whose payer is the service, nor a payout the collective is owed (F130, H7).`
    });
  }
  if (t.payeeGrants?.length) {
    more.push({
      text: `Incoming payments go to a split service, under ${t.payeeGrants.length === 1 ? "one payee grant" : `${t.payeeGrants.length} payee grants`}: ${list(t.payeeGrants.map(short))}. Each payee's own grant, signed by signing this deal; the service holds one grant key per payee, which signs only receipts for money coming into the deal, never one whose payer is the service, nor a split's payout; each payee can revoke its own grant (F129, H4, H5; F130, H7).`
    });
  }
  const holderName = (h) => h == null ? "this collective" : names(h);
  for (const [object, holders2] of t.stakes ?? []) {
    more.push({
      text: `Stake in ${object == null ? "this collective itself, a share of all its income (F121 Q8, F124 S1)" : names(object)}: ${list(holders2.map(([h, n]) => `${holderName(h)} ${n / 1e4}%`))}. Every payout matches its stake exactly, every fee alike for every stake (F124 N10); no share is lowered without its holder's signature (Agreements rule 46).`
    });
  }
  if (t.departed?.length) {
    more.push({ text: `Departed holders: ${list(t.departed.map(names))}. No voice and no veto; their share of the collective's income is in its stakes above (Agreements rule 46b, F124 N5).` });
  }
  if (t.backups?.services.length) {
    const service = (hs) => hs.length === 1 ? `the service granted by ${short(hs[0])}` : `the service granted by ${list(hs.map(short))} (one grant per payee, signed with this deal)`;
    more.push({
      text: `Backup split services, in order: ${list(t.backups.services.map(service))}. Each payment is tried at the split service first; only if that attempt fails, as the split cMIP ${t.backups.splitCmip ? short(t.backups.splitCmip) : ""} defines failure${t.backups.failure ? " (its terms for it are signed with this agreement)" : " (its defaults)"}, does it go to the next, and the next payment starts again from the first. Money only ever goes to a service named here (Agreements rule 18a, F249, F250).`
    });
  }
  for (const [judge, next] of t.chain ?? []) {
    more.push({ text: `If ${judge.startsWith("task ") ? `the judge for ${judge}` : names(judge)} answers \u201Cunknown\u201D, or does not act within its period, ${list(next.map(([hs, p]) => `${names(hs[0])} (after ${p} on the time reference)`))} take${next.length === 1 ? "s" : ""} over, in that order (Agreements rule 34a, F121).` });
  }
  more.push({
    text: "Whatever is done in the collective's name binds it once it is sealed to every member (or public) and on its chain, citing its latest decision; before that, even signed, it binds no one (Agreements rule 35a, F128). Where it is stored decides nothing: the relays are only where its clients publish and look first."
  });
  if (t.forkedFrom) {
    more.push({ text: `Forked from ${names(t.forkedFrom)}: a back-link only, deciding nothing; the fork act names this collective as a successor (Agreements rule 47a, F124 N4).` });
  }
  for (const p of t.succession ?? []) {
    const parts = [];
    if (p.stakes) parts.push(`stakes to ${list(p.stakes.map(([h, n]) => `${names(h)} (${n / 1e4}%)`))}`);
    if (p.seats) parts.push(`the seat to ${list(p.seats.map(names))}${p.entry === 1 ? ", with the members\u2019 approval" : ""}`);
    more.push({ text: `If ${names(p.party)} leaves or is declared absent: ${parts.join("; ") || "nothing named"}. A protected clause.` });
  }
  if (more.length) sections.push({ heading: "Also", lines: more });
  if (t.problem) blocking.push(problemWords(t.problem));
  const controls = [t.text, ...t.areaWords.map(([, w]) => w)].join("").match(INVISIBLE)?.length ?? 0;
  if (controls) {
    sections.push({
      heading: "Hidden characters",
      lines: [
        {
          text: `The words contain ${controls} invisible character${controls > 1 ? "s" : ""} that can make text display in another order than it is written. ${controls > 1 ? "They are" : "It is"} shown below as U+\u2026 codes (Text rule 5a). Read the words as shown before signing.`,
          tone: "warn"
        }
      ]
    });
  }
  return { sections, blocking, plain };
}
var FIELD_NAMES = {
  0: "who the members are",
  1: "the constitution's words",
  3: "the keepers",
  5: "the clone rule",
  6: "the time reference",
  7: "the stakes",
  8: "the split plan",
  9: "the abandonment clause",
  12: "the key grammar",
  13: "the arbitrators",
  14: "the split service's grant",
  16: "the succession plans",
  17: "the refund terms",
  18: "the constitutional change rule",
  19: "the areas",
  28: "the fees"
};
function planOf(before, after) {
  return agreementsClonePlan(before, after, AGREEMENTS_SPECS);
}
var powerKey = (p) => p.form === "area" ? `area ${p.area}` : p.form === "plan" ? `plan ${p.party}` : p.form;
function readChanges(beforePayload, afterPayload, names) {
  const before = termsOf(beforePayload);
  const after = termsOf(afterPayload);
  const out = [];
  const joined = after.parties.filter((p) => !before.parties.includes(p));
  const left = before.parties.filter((p) => !after.parties.includes(p));
  for (const p of joined) out.push({ text: `${names(p)} joins, bound once they sign the clone.` });
  for (const p of left)
    out.push({
      text: `${names(p)} leaves. They hand over nothing: the collective rotates to keys they never held, and from then on they have no say in it. They keep what they own (Agreements rules 37, 46, F100).`
    });
  const holder = (t) => t.grammar?.signing.form === "one" ? t.grammar.signing.holder : null;
  if (holder(before) !== holder(after) && holder(after)) {
    out.push({ text: `The signing key passes to ${names(holder(after))}${holder(before) ? ` (was ${names(holder(before))})` : ""}.` });
  }
  const sb = before.grammar?.chainKey;
  const sa = after.grammar?.chainKey;
  if (sa?.form === "shares" && sb?.form === "shares" && JSON.stringify(sa) !== JSON.stringify(sb)) {
    out.push({
      text: `The chain key is dealt afresh: ${sa.members.length} shares, any ${sa.threshold} rebuild it (was ${sb.members.length} shares, any ${sb.threshold}). Nobody leaving ever holds a share of the new key.`,
      tone: sa.threshold === 1 && sb.threshold !== 1 ? "warn" : void 0
    });
  }
  const ids = [...new Set([...before.areas, ...after.areas].map((a) => a.id))];
  for (const id of ids) {
    const b = before.areas.find((a2) => a2.id === id);
    const a = after.areas.find((x) => x.id === id);
    const held = (x) => x.holders.length ? `any ${x.threshold} of ${list(x.holders.map(names))}` : "nobody: frozen";
    if (!b && a) out.push({ text: `A new area, \u201C${a.name}\u201D (area ${id}): ${held(a)}.` });
    else if (b && !a) out.push({ text: `The \u201C${b.name}\u201D area (area ${id}) is dropped.`, tone: "warn" });
    else if (a && b && JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ text: `The \u201C${a.name}\u201D area (area ${id}) is now decided by ${held(a)} (was ${held(b)}).` });
    }
  }
  const rule = (r, parties) => ruleWords(r, parties, names);
  if (JSON.stringify(before.constitutional) !== JSON.stringify(after.constitutional)) {
    out.push({ text: `The constitution now changes with ${constitutionWords(after, names)} (was ${constitutionWords(before, names)}).` });
  }
  if (JSON.stringify(before.clone) !== JSON.stringify(after.clone)) {
    out.push({ text: `Other changes now need ${rule(after.clone, after.parties)} (was ${rule(before.clone, before.parties)}).` });
  }
  if (JSON.stringify(before.abandonment) !== JSON.stringify(after.abandonment)) {
    const words2 = (a) => !a ? "no one" : a.authority === "named" ? names(a.identity) : `any ${a.threshold} of the other parties`;
    out.push({
      text: `Absence is now judged by ${words2(after.abandonment)} (was ${words2(before.abandonment)}). A protected clause: it changes only with every member's signature, one version for everyone (Agreements rule 46a, F121).`,
      tone: "warn"
    });
  }
  if (before.text !== after.text) out.push({ text: "The constitution's words change: read the new words below, in full.", tone: "warn" });
  else out.push({ text: "The constitution's words stay the same." });
  const wb = new Map(before.areaWords);
  for (const [id, w] of after.areaWords) {
    if (wb.get(id) !== w) out.push({ text: `The \u201C${after.areas.find((a) => a.id === id)?.name ?? `area ${id}`}\u201D area's own words change: read them below.`, tone: "warn" });
  }
  let plan;
  try {
    plan = planOf(beforePayload, afterPayload);
  } catch (e2) {
    out.push({ text: `Agreements cannot say what this clone changes: ${e2 instanceof Error ? e2.message : e2}`, tone: "bad" });
    return out;
  }
  const areaName = (id) => before.areas.find((a) => a.id === id)?.name ?? after.areas.find((a) => a.id === id)?.name ?? `area ${id}`;
  for (const ch of plan.changes) {
    const what = ch.form === "field" ? FIELD_NAMES[ch.field] ?? `field ${ch.field}` : ch.form === "task" ? `the cMIP for task ${ch.task}` : ch.form === "extension" ? `the extension ${specName(ch.extension)}` : `the \u201C${areaName(ch.area)}\u201D area's own words`;
    const tier = ch.tier === "constitutional" ? "constitutional" : ch.tier === "judicial" ? "judicial, a protected clause: it changes only with every member's signature, one version for everyone (Agreements rule 46a, F121)" : ch.form === "words" ? `operational, in the \u201C${areaName(ch.area)}\u201D area` : "operational";
    out.push({ text: `A change to ${what}: ${tier}.` });
  }
  if (!plan.changes.length) out.push({ text: "Agreements find nothing changed in the terms." });
  const areas = before.areas;
  out.push({ text: `So its mark must name ${list(plan.needs.map((p) => powerWords(p, areas, names)))} (Agreements rule 44c).` });
  const claimed = (after.mark ?? []).map((e2) => powerKey(e2.power));
  if (JSON.stringify(claimed) === JSON.stringify(plan.needs.map(powerKey))) {
    out.push({ text: "Its mark names exactly that.", tone: "ok" });
  } else {
    out.push({
      text: `Its mark names ${list((after.mark ?? []).map((e2) => powerWords(e2.power, areas, names))) || "nothing"}: a false mark sinks the clone (F104).`,
      tone: "bad"
    });
  }
  return out;
}
function readRelease(m, before) {
  const files = [
    { text: `${m.name} ${m.version}: ${count(m.files.length, "file")}, ${count(m.dependencies.length, "library", "libraries")} it depends on.` },
    { text: m.source ? `Made from ${m.source}.` : "It names no source." }
  ];
  if (!m.previous) files.push({ text: "It is the first release: it names no release before it." });
  if (before) {
    const old = new Map(before.files.map((f) => [f.path, f.work]));
    const now2 = new Map(m.files.map((f) => [f.path, f.work]));
    const added = m.files.filter((f) => !old.has(f.path)).map((f) => f.path);
    const changed = m.files.filter((f) => old.has(f.path) && old.get(f.path) !== f.work).map((f) => f.path);
    const removed = before.files.filter((f) => !now2.has(f.path)).map((f) => f.path);
    files.push({
      text: `Since ${before.name} ${before.version}: ${count(added.length, "file")} added, ${changed.length} changed, ${removed.length} removed; ${count(m.files.length - added.length - changed.length, "file")} the same.`
    });
    const some = (xs, what) => {
      if (!xs.length) return;
      const shown = xs.slice(0, 30);
      files.push({ text: `${what}: ${shown.join(", ")}${xs.length > shown.length ? `, and ${xs.length - shown.length} more` : ""}.` });
    };
    some(added, "Added");
    some(changed, "Changed");
    some(removed, "Removed");
    const key = (d) => `${d.registry} ${d.name}`;
    const oldDeps = new Map(before.dependencies.map((d) => [key(d), d.version]));
    const newDeps = new Map(m.dependencies.map((d) => [key(d), d.version]));
    const depsAdded = [...newDeps.keys()].filter((k) => !oldDeps.has(k));
    const depsRemoved = [...oldDeps.keys()].filter((k) => !newDeps.has(k));
    const depsChanged = [...newDeps.keys()].filter((k) => oldDeps.has(k) && oldDeps.get(k) !== newDeps.get(k));
    if (depsAdded.length + depsRemoved.length + depsChanged.length) {
      files.push({ text: `Libraries: ${depsAdded.length} added, ${depsChanged.length} at another version, ${depsRemoved.length} removed.` });
    } else files.push({ text: "The libraries are the same." });
  } else if (m.previous) {
    files.push({ text: `It follows release ${short(m.previous)}, which this client does not hold, so what changed is not shown.` });
  }
  return [{ heading: "What is released", lines: files }];
}

// ../assess/src/assess.ts
var A = (...rules) => rules.map((rule) => ({ mir: "Agreements", rule }));
var unique = (cites) => cites.filter((c, i) => cites.findIndex((d) => d.mir === c.mir && d.rule === c.rule) === i);
var cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
var pct2 = (n) => `${Number((n / 1e4).toFixed(4))}%`;
var SHARED = ["The collective's keys", "Areas: who decides which acts", "Who decides what", "If someone disappears", "Hidden characters"];
function assess(payload, names, found) {
  const t = termsOf(payload);
  const collective = !!t.grammar;
  const problem = t.problem ? problemWords(t.problem) : null;
  const flags = problem ? [] : flagsOf(t, payload, names);
  const shared = readAgreement(t, names);
  const sections = [
    signedSection(t, names, found),
    boundSection(t, names),
    sharesSection(t, names),
    judgesSection(t, names),
    endsSection(t, names),
    owedSection(t, found),
    ...shared.sections.filter((s) => SHARED.includes(s.heading)),
    {
      heading: "Risks",
      lines: problem ? [{ text: `Not judged further: ${problem}`, tone: "bad" }] : flags.length ? flags.map((f) => ({ text: `${cap(f.text)} Rests on: ${f.rests}.`, tone: "warn" })) : [{ text: "None of the risks this tool looks for: a party with no exit, an uncapped fee, a judge who is also a party, no judge of forks, a stake diluted without its holder, money divided with no owner, or a stated cost one of its clauses brings.", tone: "ok" }]
    }
  ];
  const who2 = list(t.parties.map(names));
  const kind = collective ? "collective" : "deal";
  const summary = [
    collective ? `${t.parent ? "A new version of a collective\u2019s agreement" : "The founding agreement of a collective"} of ${t.parties.length} members: ${who2}.` : `${t.parent ? "A new version of a deal" : "A deal"} between ${t.parties.length === 1 ? "one party" : `${t.parties.length} parties`}: ${who2}.`,
    problem ? "Agreements refuse these terms: they bind nobody as they stand." : flags.length ? `${flags.length === 1 ? "One risk" : `${flags.length} risks`} flagged, each with the rule it rests on.` : "No risk flagged."
  ];
  return {
    kind,
    title: collective ? "A collective\u2019s agreement, assessed" : "A deal, assessed",
    summary,
    sections,
    plain: [{ heading: "The words, as signed", text: t.text }, ...shared.plain],
    flags,
    problem
  };
}
function signedSection(t, names, found) {
  const lines2 = [];
  if (!found) {
    lines2.push({ text: `The relays were not asked: who has signed is not known here. Its parties: ${list(t.parties.map(names))}.` });
  } else {
    for (const p of t.parties) {
      lines2.push(
        found.signed.includes(p) ? { text: `${names(p)} has signed.`, tone: "ok" } : { text: `${names(p)} has not signed: nothing in it binds ${names(p)} yet.`, tone: "warn" }
      );
    }
    if (found.invalid) lines2.push({ text: `Agreements count it invalid: ${found.invalid}`, tone: "bad" });
    else if (found.exists === true) lines2.push({ text: "It exists: every signature its rule asks for is there, as far as the relays asked show.", tone: "ok" });
    else if (found.exists === false) lines2.push({ text: "It is not in force: it exists only once every party has signed it.", tone: "warn" });
    else lines2.push({ text: "Whether it exists cannot be said from what the relays hold.", tone: "warn" });
    if (found.fork) {
      lines2.push({
        text: found.fork.tangled ? `The deal is tangled (${found.fork.tangled}): it stays on its reference ${found.fork.reference.slice(0, 8)}\u2026 until one version names every tip it drops (rule 47).` : `The deal stands forked: ${found.fork.branches.length} branches from its reference ${found.fork.reference.slice(0, 8)}\u2026; a payment under either branch counts (rule 47).`,
        tone: "warn"
      });
    } else if (found.inForce) {
      lines2.push({ text: `The version of this deal in force is ${found.inForce.slice(0, 8)}\u2026, as far as ${list(found.at)} show.` });
    }
  }
  lines2.push({ text: "Each party is bound only through its own signature act (Agreements rule 1)." });
  return { heading: "Who signed", lines: lines2 };
}
function roles(t, who2, names) {
  const out = [];
  for (const [object, holders2] of t.stakes ?? []) {
    for (const [h, n] of holders2) if (h === who2) out.push(`holds ${pct2(n)} of ${object == null ? "all of this collective\u2019s income" : names(object)}`);
  }
  if (t.arbitrators?.includes(who2)) out.push("is named arbitrator or verifier");
  if (t.forkJudge === who2) out.push("is the judge of the deal\u2019s forks");
  if (t.keepers?.[0].includes(who2)) out.push("operates a keeper");
  if (t.abandonment?.authority === "named" && t.abandonment.identity === who2) out.push("judges whether a party is absent");
  for (const [, next] of t.chain ?? []) if (next.some(([hs]) => hs[0] === who2)) out.push("takes over as a judge in the chain of judgment");
  for (const a of t.areas ?? []) if (a.holders.includes(who2)) out.push(`holds the \u201C${a.name}\u201D area`);
  for (const p of t.succession ?? []) if (p.party === who2) out.push("has a succession plan in it");
  if (t.plan?.shares.some((s) => s.kind === "receiver" && s.receiver === who2)) out.push("is a named receiver in the split plan");
  return out;
}
function boundSection(t, names) {
  const lines2 = [{ text: "Each party who signs is bound to the words below, as signed, and to every rule of these terms: a signature is consent to everything they define, pre-authorised changes included (Agreements rule 8)." }];
  for (const p of t.parties) {
    const r = roles(t, p, names);
    lines2.push({ text: `${names(p)}: ${r.length ? list(r) : "a party, with no stake or role of its own in these terms"}.` });
  }
  const others = /* @__PURE__ */ new Set();
  for (const [, holders2] of t.stakes ?? []) for (const [h] of holders2) if (h && !t.parties.includes(h)) others.add(h);
  for (const h of others) lines2.push({ text: `${names(h)}, not a party: ${list(roles(t, h, names))}. Bound by nothing here; protected by it (Agreements rules 45, 48).` });
  lines2.push({
    text: t.grammar ? "A member\u2019s obligations change only as the constitution\u2019s rules allow; no share is lowered without its holder\u2019s signature (Agreements rules 45, 48)." : "No version of it changes without every party\u2019s signature (Agreements rule 47, was 45b)."
  });
  return { heading: "What each party is bound to", lines: lines2 };
}
function sharesSection(t, names) {
  const lines2 = [];
  const stakes = t.stakes ?? [];
  stakes.forEach(([object, holders2], i) => {
    lines2.push({
      text: `Stake ${i}, in ${object == null ? "this collective itself, a share of all its income" : names(object)}: ${list(holders2.map(([h, n]) => `${h == null ? "this collective" : names(h)} ${pct2(n)}`))}, written in millionths summing to 100% (Agreements rule 9).`
    });
  });
  const p = t.plan;
  if (p) {
    const share2 = (s) => s.kind === "stake" ? `stake ${s.stake}, paid to its holders as currently held` : s.kind === "role" ? `the role \u201C${s.role}\u201D, paid to whoever fills it, with evidence the payer acknowledges (rule 22)` : s.kind === "receiver" ? `${names(s.receiver ?? "")}, a named receiver holding no stake` : `metric ${s.metric}`;
    lines2.push({
      text: `Each payment in is divided by the split cMIP ${names(p.cmip)}, which computes the amounts from these parts: ${p.shares.map((s, i) => `${share2(s)}, part ${s.part}${p.top.includes(i) ? ", taken off the top first" : ""}`).join("; ")} (Agreements rules 17, 27).`
    });
    if (p.shares.some((s) => s.kind === "role")) {
      lines2.push({
        text: p.unfilled === "stakes" ? "A role nobody fills goes to the stakes, in proportion to their parts (F218)." : p.unfilled === "held-open" ? "A role nobody fills is held open, as an obligation." : `A role nobody fills goes to ${names(p.unfilledTo ?? "")}.`
      });
    }
    const bearer = p.serviceBearsRailFees ? "The split service bears each payout\u2019s rail fee" : "Each receiver bears its payout\u2019s rail fee";
    const m = p.maxRailFee;
    lines2.push(
      m ? { text: `${bearer}; no payout may lose more than ${m.form === "millionths" ? `${pct2(m.value)} of each payout` : `${m.value} of ${names(m.unit ?? "")}`} to it, and a shortfall beyond that is the service\u2019s open obligation (Agreements rule 25).` } : { text: `${bearer}; the plan states no maximum fee per payout (Agreements rule 25).`, tone: "warn" }
    );
  }
  for (const f of t.fees ?? []) {
    const when = f.scope === "every" ? "every payment" : f.scope === "publication" ? `payments for ${names(f.of ?? "")}` : `payments by the rail ${names(f.of ?? "")}`;
    lines2.push({ text: `A fee entry: ${names(f.module)} is owed part ${f.part} of ${when}, taken off the top before the stakes divide, so it falls alike on every stake; a split leaving it out owes it (Agreements rule 28, F213, F214).` });
  }
  if (t.payeeGrants?.length || t.splitGrant) {
    lines2.push({ text: `Payments go to a split service, by ${t.splitGrant ? "the collective\u2019s grant" : `${t.payeeGrants.length === 1 ? "one payee\u2019s grant" : `each payee\u2019s own grant (${t.payeeGrants.length})`}`}: it publishes each split, delivered to every holder it pays, naming each fee and who received it (Agreements rules 16, 20).` });
    if (t.backups?.services.length) lines2.push({ text: `If an attempt at the service fails, ${t.backups.services.length === 1 ? "one backup" : `${t.backups.services.length} backups`} take${t.backups.services.length === 1 ? "s" : ""} that payment, in order (Agreements rule 17, field 29).` });
  } else if (stakes.length) {
    lines2.push({ text: "No split service: each payer\u2019s wallet pays each holder\u2019s own pointer by the stakes (payer-side splitting, Agreements rule 16)." });
  }
  if (!lines2.length) lines2.push({ text: "It divides no money: no stakes, no split plan, no fees." });
  return { heading: "Shares and fees", lines: lines2 };
}
function judgesSection(t, names) {
  const lines2 = [];
  const then = (key) => {
    const next = (t.chain ?? []).find(([j]) => j === key)?.[1] ?? [];
    return next.length ? `, then ${list(next.map(([hs, p]) => `${names(hs[0])} after ${p} on the time reference`))}, in that order` : "";
  };
  const cmip = (task) => t.cmips.find(([n]) => n === task)?.[1];
  const c9 = cmip(9);
  if (c9) lines2.push({ text: `Conditions are judged by the condition cMIP ${names(c9)}${then("task 9")}.` });
  const time = t.time ?? cmip(10);
  if (time) lines2.push({ text: `Time is judged by the time reference ${names(time)}: for this agreement, only it says whether something is before, after or past its terms (Agreements rule 33)${then("task 10")}.` });
  const c11 = cmip(11);
  if (c11) lines2.push({ text: `Anchoring is judged by ${names(c11)}${then("task 11")}.` });
  for (const a2 of t.arbitrators ?? []) lines2.push({ text: `Content is judged by ${names(a2)}, an arbitrator or verifier, who receives the keys it must judge${then(a2)}.` });
  if (!t.grammar) {
    lines2.push(
      t.forkJudge ? { text: `The judge of forks is ${names(t.forkJudge)} (field 27): if two complete versions of the deal ever stand side by side, it settles them on a party\u2019s request${then(t.forkJudge)} (Agreements rule 47).` } : { text: "No judge of forks: if two complete versions of the deal ever stand side by side, only a version every party signs settles them (Agreements rule 47).", tone: "warn" }
    );
  }
  if (t.keepers) {
    const [ops, r] = t.keepers;
    const need = ops.length === 1 ? "its record counts" : `${r.form === "all" ? `all ${ops.length}` : r.form === "threshold" ? `any ${r.threshold}` : list((r.named ?? []).map(names))} count as recorded`;
    lines2.push({ text: `${ops.length === 1 ? "A keeper records" : "Keepers record"} what happens, sealed, without reading it: operated by ${list(ops.map((o) => `${names(o)}${then(o)}`))}; ${need} (Agreements rule 36).` });
  }
  const a = t.abandonment;
  if (a) {
    lines2.push({
      text: a.authority === "named" ? `Whether a party is absent is judged by ${names(a.identity ?? "")}${a.proof ? `, checked by the absence-proof cMIP ${names(a.proof)}` : ""}${then(a.identity ?? "")} (Agreements rules 85, 87).` : `Whether a member is absent is judged by any ${a.threshold} of the other members${a.proof ? `, checked by the absence-proof cMIP ${names(a.proof)}` : ""} (Agreements rules 85, 87).`
    });
  }
  if (lines2.length) lines2.push({ text: "A judge that answers \u201Cunknown\u201D, or does not act within its period, passes the question to the next in its chain, which every party signed; only the active link settles (Agreements rule 35)." });
  else lines2.push({ text: "Nobody judges anything: no condition cMIP, no time reference, no arbitrator, keeper or absence authority." });
  return { heading: "Who judges, and in what order", lines: lines2 };
}
function endsSection(t, names) {
  const lines2 = [];
  if (t.parent) lines2.push({ text: `It is a new version of ${names(t.parent)}: once complete, it replaces it (Agreements rule 45).` });
  if (t.grammar) {
    lines2.push({ text: "Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own (Agreements rule 70)." });
    lines2.push({ text: "The collective ends by a fork, its members splitting into successors, or by a closing once it holds nothing and owes nothing (Agreements rule 91)." });
  } else {
    lines2.push({ text: "A deal has no closing act. It ends, or winds down, by a new version every party signs, stating where its stakes went, what is still owed, and, where it is a party of another agreement, to whom that one now pays (Agreements rule 47, F263)." });
    lines2.push({ text: "A party leaves only as its terms provide." });
  }
  if (t.abandonment?.outcomes.includes(4)) lines2.push({ text: `A declaration of absence may close it (Agreements rule 89, outcome 4: ${OUTCOMES[4]}).` });
  if ((t.stakes ?? []).length) {
    const r = t.releaseRule;
    lines2.push({ text: `A stake ends if released to the public domain, which ${!r || r.form === "all" ? "every holder of it signs" : r.form === "named" ? `${list((r.named ?? []).map(names))} sign` : `holders of it holding together at least ${(r.share ?? 0) / 1e4}% sign`} (Agreements rule 55, field 24; Agreements draft 14, F308: by share, never by head).` });
  }
  return { heading: "How it ends", lines: lines2 };
}
function owedSection(t, found) {
  const lines2 = [];
  const service = !!(t.payeeGrants?.length || t.splitGrant);
  if (found) {
    lines2.push(...found.owed.length ? found.owed : [{ text: `Nothing owed under it, as far as ${list(found.at)} show.` }]);
  } else {
    lines2.push({ text: "The relays were not asked: no payment made under it is known here." });
    if (service) lines2.push({ text: "What its split service receives and does not split, or splits and does not pay out, is that service\u2019s open obligation, naming one receiver and this agreement (Agreements rule 30)." });
  }
  if (t.refund?.until != null) lines2.push({ text: `A refund owed on a payment under it is claimable until ${t.refund.until} on its time reference; past that point it is ended (field 17, F219).` });
  else if (service || (t.stakes ?? []).length) lines2.push({ text: "No refund terms: a refund owed stays open until claimed (Agreements rule 11; the core sets no lapse, F80)." });
  lines2.push({ text: "A party who has not signed owes nothing under it: its obligations are shown as unsigned, never as open (Agreements rule 1, F74)." });
  return { heading: "What is still owed", lines: lines2 };
}
function mustSign(t, p) {
  const rule = (r, among) => {
    if (!r || r.form === "all") return among;
    if (r.form === "named") return r.named ?? [];
    return (r.threshold ?? 0) >= among.length ? among : [];
  };
  switch (p.form) {
    case "clone":
      return rule(t.clone, t.parties);
    case "constitutional":
      return rule(t.constitutional, t.parties);
    case "judicial":
      return t.parties;
    case "area": {
      const a = t.areas.find((x) => x.id === p.area);
      return a && a.threshold >= a.holders.length ? a.holders : [];
    }
    default:
      return [];
  }
}
function signersFor(payload, t, field) {
  const m = new Map(cborDecode(payload));
  const mark = (x) => unhex(sha2562(`deal assessment: a version changing field ${field}, ${x}`));
  m.set(11, mark("its parent"));
  m.set(4, [[[1], [...t.parties].sort().map(unhex)]]);
  if (field === 8) {
    const plan = m.get(8);
    if (plan instanceof Map) m.set(8, new Map([...plan, [7, "a changed parameter"]]));
    else m.set(8, /* @__PURE__ */ new Map([[0, [[0, 0, 1]]], [1, mark("a split cMIP")]]));
  } else {
    m.set(28, [[mark("a fee Module"), 1]]);
  }
  try {
    const plan = agreementsClonePlan(payload, cborEncode(m), AGREEMENTS_SPECS);
    return /* @__PURE__ */ new Set([...plan.needs.flatMap((p) => mustSign(t, p)), ...plan.paySigners]);
  } catch {
    return null;
  }
}
function holders(t) {
  const out = [];
  for (const [, hs] of t.stakes ?? []) for (const [h] of hs) if (h && !out.includes(h)) out.push(h);
  return out;
}
function flagsOf(t, payload, names) {
  const out = [];
  const deal = !t.grammar;
  const who2 = (xs) => list(xs.map(names));
  const owners = holders(t);
  const a = t.abandonment;
  if (deal && t.parties.length > 1) {
    const stuck = uncovered(t);
    if (stuck.length) {
      out.push({
        code: "no-exit",
        family: "listed",
        who: stuck,
        text: `${who2(stuck)} cannot be declared absent: if ${stuck.length === 1 ? "that party goes" : "any of them goes"} silent, nobody can change or end the deal, and no party can leave it.`,
        rests: "Agreements rule 47 (was 45b), stated cost: \u201Cone silent party blocks every change to a deal, however large\u201D; the way out is an abandonment clause removing an absent party\u2019s voice (rule 89, outcome 0)",
        cites: A(47, 89)
      });
    }
  }
  {
    const why = [];
    const rests = [];
    const cites = [];
    let bearers = [];
    if (t.plan && !t.plan.maxRailFee) {
      why.push("the split plan states no maximum fee per payout, so a payout may lose any rail fee and nothing beyond a maximum becomes the service\u2019s obligation");
      rests.push("Agreements rule 25 (was 24a): the split plan \u201Cmay state a maximum fee per payout\u201D; \u201Cwhere it states none, there is no cap\u201D, and a client must flag the absence before signing (F271); Money rule 21");
      cites.push(...A(25), { mir: "Money", rule: 21 });
    }
    if (owners.length) {
      const need = signersFor(payload, t, 28);
      bearers = need ? owners.filter((h) => !need.has(h)) : [];
      if (bearers.length) {
        why.push(`fees can be added or raised without ${who2(bearers)}, who bear${bearers.length === 1 ? "s" : ""} them with every stake`);
        rests.push("Agreements rule 28 (was 27): fees come off the top of every stake, and their bearers consent by the power the fees field falls under, not each by their own signature, save a holder with no voice in it, who signs a version paying its stake less (rule 48, F270)");
        cites.push(...A(28, 48));
      }
    }
    if (why.length) out.push({ code: "uncapped-fee", family: "listed", who: bearers.length ? bearers : void 0, text: `Uncapped fee: ${why.join("; and ")}.`, rests: rests.join("; "), cites });
  }
  {
    const judges = /* @__PURE__ */ new Map();
    const add = (h, as) => {
      if (!h || !t.parties.includes(h)) return;
      judges.set(h, [...judges.get(h) ?? [], as]);
    };
    for (const x of t.arbitrators ?? []) add(x, "an arbitrator");
    add(t.forkJudge, "the judge of forks");
    for (const x of t.keepers?.[0] ?? []) add(x, "a keeper\u2019s operator");
    if (a?.authority === "named") add(a.identity, "the absence authority");
    for (const [, next] of t.chain ?? []) for (const [hs] of next) add(hs[0], "a later link of the chain of judgment");
    if (judges.size) {
      const ids = [...judges.keys()];
      out.push({
        code: "judge-is-party",
        family: "listed",
        who: ids,
        text: `A judge who is also a party: ${list(ids.map((h) => `${names(h)} judges as ${list([...new Set(judges.get(h))])}`))}, in a question where they have a stake of their own.`,
        rests: "Agreements rule 35 (was 34a), the chain of judgment, which every party signs; Agreements bar it for specifications only (\u201Ca judge never handles what it judges\u201D, Q20), and let a party be the absence authority (rule 85)",
        cites: A(35, 85)
      });
    }
  }
  if (deal && t.parties.length > 1 && !t.forkJudge) {
    out.push({
      code: "no-fork-judge",
      family: "listed",
      text: "No judge of forks: if two complete versions of the deal ever stand side by side, the deal stays on its reference until every party signs one settling version, and any party can keep it there.",
      rests: "Agreements rule 47 (was 45b), field 27: \u201CWith no judge of forks named, the deal stays on its reference\u201D; stated cost: \u201Ca party of either branch can refuse every settlement and keep the deal on its reference\u201D",
      cites: A(47)
    });
  }
  if (owners.length) {
    const hit = /* @__PURE__ */ new Set();
    const why = [];
    const rests = [];
    const cites = [];
    const lose = (a?.outcomes ?? []).filter((o) => o === 1 || o === 2);
    if (a && lose.length) {
      const heir = (h) => (t.succession ?? []).some((s) => s.party === h && (s.stakes ?? []).length > 0);
      const declarable = (h) => (t.parties.includes(h) || (t.departed ?? []).includes(h)) && !(a.authority === "named" && h === a.identity);
      const declared = owners.filter((h) => declarable(h) && !heir(h));
      if (declared.length) {
        for (const h of declared) hit.add(h);
        why.push(`${who2(declared)}, naming no stake successor, may be declared absent and have ${declared.length === 1 ? "that stake" : "those stakes"} ${list(lose.map((o) => o === 1 ? "shared among the remaining holders" : "transferred to parties named or defined by role"))}, without signing; naming a successor sends the stake to the successor instead`);
        rests.push("Agreements rule 89 (was 53), new in draft 12 (F279): outcomes 1 and 2 apply to a stake \u201Conly where the holder\u2019s succession plan names no stake successor\u201D; rule 48");
        cites.push(...A(48, 89));
      }
    }
    const r = t.releaseRule;
    if (r && r.form !== "all") {
      const need2 = new Set(r.form === "named" ? r.named ?? [] : []);
      const left2 = owners.filter((h) => !need2.has(h));
      if (left2.length) {
        for (const h of left2) hit.add(h);
        why.push(`a stake can be released to the public domain, ending what it earns, without ${who2(left2)}`);
        rests.push("Agreements rule 55 (was 17), field 24: the release rule says which holders sign a release");
        cites.push(...A(55));
      }
    }
    const need = signersFor(payload, t, 8);
    const left = need ? owners.filter((h) => !need.has(h)) : [];
    if (left.length) {
      for (const h of left) hit.add(h);
      why.push(`the split plan, which sets what each stake is paid, can be changed without ${who2(left)}`);
      rests.push("Agreements rules 45 and 48: the split plan (field 8) falls under its own power (rules 62 to 65; every party in a deal, rule 47); a version paying a stake less needs the signature of a holder with no voice in that power (a deal\u2019s holder who is no party, a collective\u2019s departed holder: rule 48, F270, F274), not of a member, whom the collective\u2019s own rules bind");
      cites.push(...A(45, 48, 62, 63, 64, 65, 47));
    }
    if (why.length) out.push({ code: "dilutable-stake", family: "listed", who: owners.filter((h) => hit.has(h)), text: `A stake can be diluted without its holder: ${why.join("; and ")}.`, rests: rests.join("; "), cites: unique(cites) });
  }
  if (!(t.stakes ?? []).length && (t.plan || (t.fees ?? []).length)) {
    out.push({
      code: "no-owner",
      family: "listed",
      text: "No owner: it divides money but writes no stake, so every share is overhead, taken off the top, and nothing is left for an owner. Nobody is paid as an owner is, protected against a fee raised or a share added without their signature. A deal made on a vow writes a stake in the vow, held by whoever signed it, and what is left after the overhead is theirs.",
      rests: "Agreements rule 14, new in draft 13 (F284): \u201Ca deal made on a vow has an owner: the vow\u2019s signer, who holds the stake\u201D; rule 22 (F280): every share paying anyone but a stake is paid off the top, what is left going to the stakes alone; rule 48 (F270): a stake is not paid less without its holder",
      cites: A(14, 22, 48)
    });
  }
  if (a && !a.proof) {
    out.push({
      code: "absence-on-word",
      family: "stated cost",
      text: `Absence is on ${a.authority === "named" ? `${names(a.identity ?? "")}\u2019s` : "the other members\u2019"} word alone: no absence-proof cMIP checks it, and a party declared absent wrongly can only contest it, in public.`,
      rests: "Agreements rule 87 (was 51), stated cost: a declaration is the authority\u2019s judgment, \u201Ca stated cost the party accepted\u201D; rule 85 (was 49), client conformance (F178)",
      cites: A(87, 85)
    });
  }
  if (owners.length) {
    if (t.payeeGrants?.length || t.splitGrant) {
      out.push({
        code: "split-service-window",
        family: "stated cost",
        text: "A split service holds the money between receiving and paying out: after a stake is sold, a seller and the service acting together can keep paying the seller until the first split citing the sale.",
        rests: "Agreements rule 10 (was 14), stated cost (the window after a transfer); rule 32 (was 31), the trust that remains",
        cites: A(10, 32)
      });
    } else {
      out.push({
        code: "payer-side-split",
        family: "stated cost",
        text: "No split service: each payer divides its own payment, so a payer can pay some holders and not others, every holder\u2019s pointer is visible to payers, and the payer decides who gets a leftover unit.",
        rests: "Agreements rule 16 (was 18), stated cost (payer-side splitting); rule 9, stated cost (the payer decides tied units)",
        cites: A(16, 9)
      });
    }
  }
  return out;
}

// ../repo/src/manifest.ts
function validPath(p) {
  if (!p || p.startsWith("/") || p !== p.normalize("NFC")) return false;
  if (/[\\\u0000-\u001f\u007f]/.test(p)) return false;
  return p.split("/").every((s) => s !== "" && s !== "." && s !== "..");
}
var enc = new TextEncoder();
function byBytes(a, b) {
  const x = enc.encode(a);
  const y = enc.encode(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
}
function decodeManifest(bytes) {
  const m = cborDecode(bytes);
  if (!(m instanceof Map)) throw new Error("a manifest is a map");
  for (const k of m.keys()) if (typeof k !== "number" || k < 0 || k > 6) throw new Error(`manifest: unknown field ${k}`);
  const text2 = (v, w) => {
    if (typeof v !== "string") throw new Error(`manifest: ${w}`);
    return v;
  };
  const bytesOf = (v, n, w) => {
    if (!(v instanceof Uint8Array) || v.length !== n) throw new Error(`manifest: ${w}`);
    return v;
  };
  const list5 = (v, w) => {
    if (!Array.isArray(v)) throw new Error(`manifest: ${w}`);
    return v;
  };
  const prev = m.get(2);
  const files = list5(m.get(3), "files").map((x) => {
    const a = list5(x, "file");
    if (a.length !== 6) throw new Error("manifest: a file has six fields");
    const size = a[2];
    if (typeof size !== "number" || !Number.isSafeInteger(size) || size < 0) throw new Error("manifest: file size");
    return {
      path: text2(a[0], "file path"),
      work: hex(bytesOf(a[1], 32, "work hash")),
      size,
      locked: hex(bytesOf(a[3], 32, "locked hash")),
      nonce: bytesOf(a[4], 24, "nonce"),
      key: bytesOf(a[5], 32, "key")
    };
  });
  if (!files.length) throw new Error("manifest: no files");
  files.forEach((f, i) => {
    if (!validPath(f.path)) throw new Error(`manifest: not a valid path: ${JSON.stringify(f.path)}`);
    if (i && byBytes(files[i - 1].path, f.path) >= 0) throw new Error("manifest: paths sorted and unique");
  });
  const dependencies = list5(m.get(4), "dependencies").map((x) => {
    const a = list5(x, "dependency");
    if (a.length !== 4) throw new Error("manifest: a dependency has four fields");
    return {
      registry: text2(a[0], "registry"),
      name: text2(a[1], "dependency name"),
      version: text2(a[2], "dependency version"),
      checksum: text2(a[3], "dependency checksum")
    };
  });
  let impl;
  if (m.has(6)) {
    const entries = list5(m.get(6), "implements").map((e2) => {
      if (!Array.isArray(e2) || e2.length < 1 || e2.length > 2) throw new Error("manifest: an implemented specification is [spec, ? hint]");
      const spec = hex(bytesOf(e2[0], 32, "an implemented specification"));
      return e2.length === 2 ? { spec, hint: hex(bytesOf(e2[1], 32, "a publication hint")) } : { spec };
    });
    if (!entries.length) throw new Error("manifest: implements names at least one specification");
    entries.forEach((x, i) => {
      if (i && entries[i - 1].spec >= x.spec) throw new Error("manifest: implements sorted by spec hash and unique");
    });
    impl = entries;
  }
  return {
    name: text2(m.get(0), "name"),
    version: text2(m.get(1), "version"),
    previous: prev === null ? null : hex(bytesOf(prev, 32, "previous")),
    files,
    dependencies,
    source: m.has(5) ? text2(m.get(5), "source") : void 0,
    implements: impl
  };
}

// ../connector/src/words.ts
var INVISIBLE2 = /[؜​‎‏‪-‮⁦-⁩]/g;
function escapeControls(s) {
  return s.replace(INVISIBLE2, (c) => `<U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}>`);
}

// src/signing.ts
var SIGNING_SAY = "Even more experimental than Dub itself. Here you sign agreements for real collectives: founding one, changing its members, its releases. A signature binds you, and it is public. Read every proposal in full before signing; when in doubt, decline.";
var SIGNING_OFF_SAY = "Signing is off: proposals to sign wait in your inbox, unread, until you turn Signing on in the identity window.";
var SHARE_SAY = [
  "This is your share of the collective\u2019s chain key: its number and 24 words. Write both on paper, in order, and keep the paper away from anything that goes online.",
  "It is shown once. Dub keeps nothing of it: once you have typed three words back, the one-time key it came sealed to is destroyed, and the copy on the relays can never be opened again.",
  "With enough members\u2019 papers, the collective\u2019s keys can be changed (in Ki\u0161ib, later). A lost paper weakens that, as the collective\u2019s rule allows; never type these words into Dub again.",
  "It is not your own chain key, nor your signing key, nor a Bitcoin wallet."
];
async function fetchAct2(id, hints, via2 = {}) {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via2).getAct(id);
      if (a && describeAct(a).id === id) return { act: a, at: h };
    } catch {
    }
  }
  return null;
}
async function readProposal(act, names, hints, via2 = {}) {
  const d = describeAct(act);
  const blocking = [];
  if (!d.public || !d.payload) {
    return { kind: "other", title: "A private act", summary: ["It cannot be read here, so it cannot be signed here."], sections: [], plain: [], risks: [], blocking: ["It is private."], collective: null };
  }
  if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.terms) {
    const a = assess(d.payload, names);
    const t = termsOf(d.payload);
    const parent = t.parent;
    const sections = [...a.sections];
    const collective = null;
    let kind = "founding";
    if (parent) {
      kind = "clone";
      const p = await fetchAct2(parent, hints, via2);
      const pd = p ? describeAct(p.act) : null;
      if (pd?.payload) sections.unshift({ heading: "What it changes", lines: readChanges(pd.payload, d.payload, names) });
      else blocking.push(`The agreement it changes (${parent}) was not found, so what it changes cannot be shown.`);
    }
    if (!t.grammar) blocking.push("These terms found no collective: Dub signs collectives\u2019 agreements only.");
    if (a.problem) blocking.push(`Agreements refuse these terms: ${a.problem}`);
    return {
      kind,
      title: kind === "founding" ? `Found a collective: ${a.title}` : `Change a collective\u2019s agreement: ${a.title}`,
      summary: a.summary,
      sections,
      plain: a.plain.map((x) => ({ heading: x.heading, text: escapeControls(x.text) })),
      risks: a.flags.map((f) => ({ text: f.text, rests: f.rests })),
      blocking,
      collective
    };
  }
  if (d.spec === SPECS.envelopes && d.type === 0) {
    const m = cborDecode(d.payload);
    if (hex(m.get(0)) !== REPO_SPECS.manifest) {
      return { kind: "other", title: "A publication", summary: ["It is no release: nothing to sign here."], sections: [], plain: [], risks: [], blocking: ["Not a release."], collective: null };
    }
    const lockedHash = hex(m.get(2));
    let manifest = null;
    for (const h of [.../* @__PURE__ */ new Set([...m.get(6) ?? [], ...hints])]) {
      try {
        const locked = await relayAt(h, via2).getMedia(lockedHash);
        if (!locked) continue;
        const plain = openMedia(locked, m.get(5), m.get(4));
        if (workHash(plain) !== hex(m.get(1))) continue;
        manifest = decodeManifest(plain);
        break;
      } catch {
      }
    }
    if (!manifest) {
      return { kind: "release", title: "A release", summary: ["Its manifest was not found, so what it releases cannot be shown."], sections: [], plain: [], risks: [], blocking: ["Its manifest was not found."], collective: d.signer ?? null };
    }
    const files = manifest.files.slice(0, 200).map((f) => ({ text: `${f.path}: ${f.size} bytes, fingerprint ${f.work.slice(0, 16)}\u2026` }));
    if (manifest.files.length > 200) files.push({ text: `And ${manifest.files.length - 200} more files.` });
    return {
      kind: "release",
      title: `Sign a release: ${manifest.name} ${manifest.version}`,
      summary: [
        `Published by the collective ${names(d.signer)}. It counts as the collective\u2019s release once enough holders of its Releases area have signed it, each with an act of their own (Agreements rule 60).`,
        "Dub cannot compare these files with a copy of your own: sign only if you checked them elsewhere (each file\u2019s fingerprint is listed)."
      ],
      sections: [...readRelease(manifest, null), { heading: `Its files (${manifest.files.length})`, lines: files }],
      plain: [],
      risks: [],
      blocking,
      collective: d.signer ?? null
    };
  }
  return { kind: "other", title: "An act Dub does not sign", summary: ["Dub signs founding terms, clones of a collective\u2019s agreement, and releases."], sections: [], plain: [], risks: [], blocking: ["Not something Dub signs."], collective: null };
}

// src/carryin.ts
var message2 = (e2) => e2 instanceof Error ? e2.message : String(e2);
var NOT_CURRENT = "These words do not give this identity\u2019s current signing key: they are another identity\u2019s, an earlier key\u2019s, or written wrong. Nothing was kept. If these are your chain key\u2019s words, they must never be typed into an online app.";
async function lookCurrent(id, seed, hints, via2) {
  let pub;
  try {
    pub = signingPublic(seed);
  } catch {
    throw new Error("The words do not hold a signing key. Nothing was kept.");
  }
  let look;
  try {
    look = await lookUp(id, hints, via2);
  } catch (e2) {
    throw new Error(`This identity was not found at ${hints.join(", ")}: ${message2(e2)}`);
  }
  const r = look.resolution;
  if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing can be signed for it until they agree.");
  if (r.stop === "pending" || r.waiting.length) throw new Error("A change of its keys is waiting for its homes: bring it once that change counts, with the new words.");
  if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
  if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
  return look;
}
async function servedChain(id, homes, via2) {
  for (const h of homes) {
    try {
      const chain = (await relayAt(h.hint, via2).identity(id)).chain;
      if (chain.length) return chain;
    } catch {
    }
  }
  throw new Error("None of its homes served its chain.");
}
function carriedKey(look, seed) {
  const secret = encryptionSecret(seed);
  if (!look.encryptionKey || !look.encryptionKeyAct || hex(xwingPublic(secret)) !== hex(look.encryptionKey)) return null;
  const e2 = look.verifier.latest(look.resolution.identity, SPECS.envelopes, 4);
  const version = e2.payload ? Number(cborDecode(e2.payload).get(0)) : 1;
  return { version, act: look.encryptionKeyAct, secret: hex(secret) };
}

// src/names.ts
var NAMING_SPEC = sha2562("Naming cMIP, draft 1, test value until publication");
var NAME = 4;
var NAME_WITHDRAWAL = 5;
var MAX_NAME = 48;
var FORBIDDEN = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]", "u");
function nameProblem(name) {
  if (name !== name.normalize("NFC")) return "it is not canonical text (NFC)";
  if (!name.trim()) return "it is empty";
  if (/^\s|\s$/u.test(name)) return "it starts or ends with a space";
  if (FORBIDDEN.test(name)) return "it holds a line break, a control character or a direction override";
  if ([...name].length > MAX_NAME) return `it is longer than ${MAX_NAME} characters`;
  return null;
}
function readName(typed) {
  const name = typed.normalize("NFC").trim();
  const why = nameProblem(name);
  if (why) throw new Error(`That name cannot be used: ${why}. Nothing was signed.`);
  return name;
}
var namePayload = (name) => cborEncode(
  /* @__PURE__ */ new Map([
    [0, name],
    [1, unhex(NAMING_SPEC)]
  ])
);
async function namesOf(identity, places, via2 = {}) {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const l = await lookUp(identity, places, via2, v);
  const routed = l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
  const at = [.../* @__PURE__ */ new Set([...l.resolution.homes.map((h) => h.hint), ...routed, ...places])];
  await holdSequence(v, identity, l, at, via2);
  const names = /* @__PURE__ */ new Map();
  const withdrawn = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ signer: identity, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          let d;
          try {
            d = describeAct(it.item);
          } catch {
            continue;
          }
          if (seen.has(d.id) || d.spec !== SPECS.identity || d.signer !== identity) continue;
          if (d.type !== NAME && d.type !== NAME_WITHDRAWAL) continue;
          seen.add(d.id);
          v.add(it.item);
          if (v.status(d.id) !== "valid") continue;
          if (d.type === NAME_WITHDRAWAL) {
            for (const [chain, target] of d.objects ?? []) if (chain === target) withdrawn.add(target);
            continue;
          }
          const m = cborDecode(d.payload);
          const name = m.get(0);
          const cmip = m.get(1);
          if (typeof name !== "string" || !(cmip instanceof Uint8Array) || hex(cmip) !== NAMING_SPEC) continue;
          if (nameProblem(name)) continue;
          names.set(d.id, { act: d.id, name });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return [...names.values()].filter((n) => !withdrawn.has(n.act)).sort((a, b) => a.act < b.act ? -1 : 1);
}

// src/shapes.ts
var PUBLISH_WARNING = "Anyone can read whom this identity follows, now and for good: a later change of mind stops new versions, it does not take this one back. The names you gave them stay in this app.";

// src/people.ts
var PEOPLE_SPEC = sha2562("People cMIP, draft 1, test value until publication");
var FOLLOW_LIST = 0;
var NO_PEOPLE = () => ({ follows: [], muted: [], list: "private", published: null, seen: [], inbox: { after: {}, items: [] }, sent: [] });
function followListPayload(a) {
  const m = /* @__PURE__ */ new Map([[0, a.version]]);
  if (a.previous) m.set(1, unhex(a.previous));
  m.set(2, a.withdrawn ? [] : a.ids.map(unhex));
  if (a.withdrawn) m.set(3, true);
  return cborEncode(m);
}
async function readFollowList(identity, places, via2 = {}) {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const l = await lookUp(identity, places, via2, v);
  const routed = l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
  const at = [.../* @__PURE__ */ new Set([...routed, ...places, ...l.resolution.homes.map((h) => h.hint)])];
  await holdSequence(v, identity, l, at, via2);
  const acts = /* @__PURE__ */ new Map();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ signer: identity, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          let d;
          try {
            d = describeAct(it.item);
          } catch {
            continue;
          }
          if (acts.has(d.id) || !d.public || d.spec !== PEOPLE_SPEC || d.type !== FOLLOW_LIST || d.signer !== identity || !d.payload) continue;
          v.add(it.item);
          if (v.status(d.id) !== "valid") continue;
          try {
            const m = cborDecode(d.payload);
            const version = Number(m.get(0));
            const prev = m.get(1);
            const ids = m.get(2).filter((x) => x instanceof Uint8Array).map(hex);
            acts.set(d.id, { version, previous: prev instanceof Uint8Array ? hex(prev) : null, ids, withdrawn: m.get(3) === true });
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  const out = { act: null, version: 0, ids: [], withdrawn: false, forked: null };
  let at_ = null;
  for (; ; ) {
    const next = [...acts.entries()].filter(([, a2]) => a2.previous === at_ && a2.version === out.version + 1);
    if (next.length !== 1) {
      if (next.length > 1) out.forked = out.version;
      return out;
    }
    const [id, a] = next[0];
    Object.assign(out, { act: id, version: a.version, ids: a.ids, withdrawn: a.withdrawn });
    at_ = id;
  }
}

// src/dub.ts
var CHAIN_WORDS_SAY = [
  "These are the chain key\u2019s words. Write them on paper, in order, and keep the paper away from anything that goes online. They are shown once: Dub keeps nothing of the chain key.",
  "The chain key is the only way to change this identity\u2019s signing key if it is ever stolen or lost. That is done by another app, MOR Safety, never by Dub. Lost paper means no change of keys, ever.",
  "Never type these words into Dub, or into any app that goes online. They are not the signing key\u2019s words, which Dub shows on request.",
  "They are not a Bitcoin wallet. Never type them into one."
];
var CARRY_SAY = [
  "These are the signing key\u2019s words. With the ID, they bring this identity into Dub on another computer or device: choose \u201CBring an identity you have\u201D there.",
  "Whoever holds these words can post as this identity and read its private messages. The chain key is not in them.",
  "Write them on paper: if this app\u2019s storage is lost, they are the way back. They stop working when the signing key is changed.",
  "Each place you bring them keeps its own line of acts. A change of the signing key must keep every line, or that line\u2019s posts become void.",
  "They are not a Bitcoin wallet. Never type them into one."
];
var LINE_SAY = "This app keeps its own line of acts for this identity. If the signing key is ever changed (with the chain key, in MOR Safety), that change must keep this line, or every post made here becomes void. The app making the change reads this line from the homes and relays and keeps it, unless you leave it out; if it cannot read it, give it this line\u2019s latest act, position and summary, shown in the identity window.";
var SPENT_SAY = "This identity\u2019s signing key was changed elsewhere, with its chain key, so the signing key\u2019s words this app holds no longer count. Nothing was signed. Changing keys is MOR Safety\u2019s work, not Dub\u2019s. To go on here, give this app the new signing key\u2019s words.";
var NO_KEY_SAY = "This app holds no encryption key for this identity, so its private messages cannot be opened here: its encryption key was not made from its signing key\u2019s words. Messages can still be sent from here.";
var READER = "https://reader.dubsar.org/";
var NO_SIGNING = () => ({ answered: {}, waiting: {}, received: {} });
var list2 = (xs) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
var message3 = (e2) => e2 instanceof Error ? e2.message : String(e2);
var now = () => Math.floor(Date.now() / 1e3);
var fingerprint = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
function randomBelow(n) {
  const limit = Math.floor(4294967296 / n) * n;
  const x = new Uint32Array(1);
  do
    crypto.getRandomValues(x);
  while (x[0] >= limit);
  return x[0] % n;
}
var NAMES_FOR = 600;
var Dub = class {
  /** `web`: Dub's web client (F281). `reader`: where long-form documents open. */
  constructor(store, opts = {}) {
    this.store = store;
    this.opts = opts;
  }
  queue = Promise.resolve();
  /** Display names found, by ID, and when (this app's memory only). */
  names = /* @__PURE__ */ new Map();
  /** One thing at a time: a sequence must never be signed twice at once. */
  serial(f) {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => void 0);
    return next;
  }
  // ------------------------------------------------------------ who is who
  whoFrom(id, me, p) {
    const f = p?.follows.find((x) => x.id === id);
    return {
      id,
      short: fingerprint(id),
      names: this.names.get(id)?.names ?? [],
      pet: f?.name ?? null,
      me: id === me,
      followed: !!f,
      muted: !!p?.muted.includes(id)
    };
  }
  /** Read the display names of these identities, where not read lately. A name not found is no name: silence proves nothing. */
  async warm(ids, places, via2) {
    const due = [...new Set(ids)].filter((id) => (this.names.get(id)?.at ?? 0) + NAMES_FOR < now());
    await Promise.all(
      due.map(async (id) => {
        try {
          this.names.set(id, { names: (await namesOf(id, places, via2)).map((n) => n.name), at: now() });
        } catch {
        }
      })
    );
  }
  // ------------------------------------------------------------ state
  async state() {
    const active = await this.store.active();
    const held = [];
    for (const id of await this.store.held()) {
      const s = await this.store.settings(id);
      held.push({ id, grouped: groupId(id), who: this.whoFrom(id, active, null), active: id === active, kind: s.kind });
    }
    const pend = await this.store.pending();
    const out = { stage: "identity", held };
    if (pend) {
      out.stage = "confirm";
      out.confirm = { positions: pend.positions, id: pend.identity.identity };
    }
    const me = active ? await this.store.identity(active) : null;
    if (me) {
      const s = await this.store.settings(me.id);
      const p = await this.store.people(me.id);
      const own = ownLine(me.f.sequence);
      if (!pend) out.stage = "ready";
      out.identity = {
        id: me.id,
        grouped: groupId(me.id),
        who: this.whoFrom(me.id, me.id, p),
        kind: s.kind,
        homes: me.f.homes.map((h) => h.hint),
        relays: s.relays,
        encryption: me.f.encryption.length > 0,
        oldChainKey: !!me.f.safety.seeds,
        line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null },
        list: p.list,
        signing: !!s.signing,
        follows: p.follows.map((f) => this.whoFrom(f.id, me.id, p)),
        muted: p.muted.map((m) => this.whoFrom(m, me.id, p))
      };
    }
    return out;
  }
  async ctx() {
    const active = await this.store.active();
    const me = active ? await this.store.identity(active) : null;
    if (!me) throw new Error("No identity in use: make one, or bring one, in the identity window.");
    const s = await this.store.settings(me.id);
    const p = await this.store.people(me.id);
    return { me, s, p, hints: [.../* @__PURE__ */ new Set([...s.relays, ...me.f.homes.map((h) => h.hint)])] };
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
        throw new Error(`${hint} did not answer: ${message3(e2)}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      out.push({ operator: hex(op), hint });
    }
    return out;
  }
  // ------------------------------------------------------------ the identity window: a new identity
  /**
   * Make a new identity with the genesis client's code, and show its chain
   * key's words once (F332, amended): the chain key is derived from a seed
   * shown as words (the words seed Module) and kept nowhere, on the Mac as on
   * the web. Nothing is published until three of the words are typed back
   * (`confirm`). Starting again forgets the last one.
   */
  async begin(a) {
    const via2 = a.via ?? {};
    const name = a.name?.trim() ? readName(a.name) : void 0;
    const hints = list2(a.homes);
    if (!hints.length) throw new Error("Give at least one home address: where the identity lives, and anyone can check it.");
    const homes = await this.homes(hints, via2);
    const relays = list2(a.relays);
    for (const r of relays) if (!/^https?:\/\//.test(r)) throw new Error(`\u201C${r}\u201D: an address starts with https:// (or http://)`);
    const positions = threePositions(randomBelow);
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const chain = newChainKey(seed);
    const id = TestIdentity.create({ homes, via: via2, chainKey: chain.key });
    id.f.safety = { scheme: 0, seeds: "" };
    chain.key.seeds.fill(0);
    await this.store.savePending({ identity: id.f, positions, relays: relays.length ? relays : hints, via: via2, chainSeed: hex(seed), ...name ? { name } : {} });
    seed.fill(0);
    return { words: chain.words, positions, say: CHAIN_WORDS_SAY };
  }
  /** Forget a new identity before it was published. */
  async abandon() {
    await this.store.dropPending();
  }
  /**
   * The three words typed back. Refused, with nothing published, unless
   * each is the word at its position. Then the genesis goes to the homes; its
   * routes name the relays as its outbox and its inbox; its encryption key,
   * the one its signing key's words carry (the carry Module, draft 2, 2a.2),
   * is published, as the desk's identities have theirs at once; and it is the
   * identity in use.
   */
  confirm(typed) {
    return this.serial(async () => {
      const p = await this.store.pending();
      if (!p) throw new Error("No new identity is waiting.");
      if (!typedBack(toWords(unhex(p.chainSeed)), p.positions, typed)) {
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
      await this.store.saveSettings(id.id, { kind: "made", relays: p.relays, via: p.via });
      await this.store.saveIdentity(id);
      await this.store.setActive(id.id);
      await this.store.dropPending();
      await id.publishRoutes([
        { scope: null, hints: p.relays, kind: 0 },
        { scope: null, hints: p.relays, kind: 1 }
      ]);
      await this.store.saveIdentity(id);
      await id.publishEncryptionKey(encryptionSecret(unhex(id.f.signingSecret)));
      await this.store.saveIdentity(id);
      for (const r of p.relays) {
        for (const act of id.chainActs()) {
          try {
            await relayAt(r, p.via).putAct(act);
          } catch {
          }
        }
      }
      lines2.push({ text: `Its posts are published at, and its inbox is, ${p.relays.join(", ")}. Its encryption key is published: private messages can be sealed to it.` });
      if (p.name) {
        try {
          lines2.push(...(await this.publishName(id, { relays: p.relays, via: p.via }, p.name)).lines);
        } catch (e2) {
          lines2.push({ text: `The display name was not published (${message3(e2)}). Give it again in the identity window.`, tone: "warn" });
        }
      }
      return { lines: lines2 };
    });
  }
  // ------------------------------------------------------------ the identity window: an identity made elsewhere
  /**
   * Bring an identity made elsewhere (the carry Module, section 4): read its
   * chain from its homes, starting at `address`, and keep it only if the
   * words give its current signing key; with its encryption key where the
   * words carry the one that counts (2a.3). Relays are asked for only where
   * its routes name none. This app starts its own line. An identity already
   * held here takes the new words instead (`renew`).
   */
  bring(a) {
    return this.serial(async () => {
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
      if ((await this.store.held()).includes(id)) return this.renewHeld(id, seed);
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error("Give an address where this identity is found (one of its homes), starting with https://.");
      const look = await this.lookCurrent(id, seed, [address], via2);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await this.servedChain(id, r.homes, via2);
      const named = list2(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list2(a.relays ?? []);
      if (!relays.length) {
        throw new Error("This identity names no relays for its posts. Give one or more relay addresses, and bring it again.");
      }
      const enc2 = this.carriedKey(look, seed);
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
        encryption: enc2 ? [enc2] : [],
        pending: null
      };
      await this.store.saveSettings(id, { kind: "brought", relays, via: via2 });
      await this.store.saveIdentity(new TestIdentity(f, via2));
      await this.store.setActive(id);
      return {
        lines: [
          { text: "Its current signing key matches the words.", tone: "ok" },
          enc2 ? { text: "Its encryption key is the one the words carry: its private messages open here.", tone: "ok" } : { text: NO_KEY_SAY, tone: "warn" },
          { text: named.length ? `Its posts are published at the relays it names: ${relays.join(", ")}.` : `It names no relays: its posts are published at ${relays.join(", ")}.` },
          { text: LINE_SAY, tone: "warn" }
        ]
      };
    });
  }
  lookCurrent(id, seed, hints, via2) {
    return lookCurrent(id, seed, hints, via2);
  }
  servedChain(id, homes, via2) {
    return servedChain(id, homes, via2);
  }
  carriedKey(look, seed) {
    return carriedKey(look, seed);
  }
  /**
   * The new signing key's words, after a rotation made elsewhere counts (the
   * carry Module, draft 2, 4.6; F332, amended): checked as any brought words
   * are, then this app signs with them in a new line under the new binding,
   * keeping what it held of the identity. Where this app published the
   * identity's last encryption key, it publishes the next one, from the new
   * words (2a.4).
   */
  renew(words2) {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error("No identity in use.");
      let seed;
      try {
        seed = fromWords(words2);
      } catch (e2) {
        if (e2 instanceof Refused) throw new Error(`${e2.message}. Nothing was kept.`);
        throw e2;
      }
      return this.renewHeld(active, seed);
    });
  }
  async renewHeld(id, seed) {
    const me = await this.store.identity(id);
    const s = await this.store.settings(id);
    const look = await this.lookCurrent(id, seed, [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    if (hex(seed) === me.f.signingSecret) throw new Error("These are the signing key\u2019s words this app already holds, and they still count: nothing to change.");
    const r = look.resolution;
    const binding = r.links[r.links.length - 1];
    me.f.chain = (await this.servedChain(id, r.homes, s.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.signingSecret = hex(seed);
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    me.f.pending = null;
    me.f.sequence = [];
    me.f.routes = me.f.routes && look.routes.act === me.f.routes.act ? me.f.routes : null;
    const lines2 = [{ text: "The new signing key\u2019s words give its current signing key. This app signs with them from now on, in a new line.", tone: "ok" }];
    const carried = this.carriedKey(look, seed);
    const last = me.f.encryption.at(-1);
    if (carried) {
      if (!me.f.encryption.some((e2) => e2.act === carried.act)) me.f.encryption.push(carried);
      lines2.push({ text: "Its encryption key is the one the new words carry.", tone: "ok" });
      await this.store.saveIdentity(me);
    } else if (last && look.encryptionKeyAct === last.act) {
      await this.store.saveIdentity(me);
      await me.publishEncryptionKey(encryptionSecret(seed));
      await this.store.saveIdentity(me);
      lines2.push({ text: "Its encryption key was renewed from the new words: messages sealed from now on open only with them. Messages sealed before, to the old key, stay readable by whoever held the old words.", tone: "ok" });
    } else {
      await this.store.saveIdentity(me);
      lines2.push({ text: NO_KEY_SAY, tone: "warn" });
    }
    lines2.push({ text: LINE_SAY, tone: "warn" });
    return { lines: lines2 };
  }
  /** Use another identity held here. */
  async use(id) {
    if (!(await this.store.held()).includes(id)) throw new Error("This app does not hold that identity.");
    await this.store.setActive(id);
  }
  /** Forget an identity here: its keys go. Only its signing key's words, written down, bring it back. Its posts stay published. */
  forget(id) {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error("This app does not hold that identity.");
      const was = await this.store.active();
      await this.store.forget(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }
  /** The identity's ID and its signing key's words (the carry Module), on request: the way to another app. */
  async carry() {
    const { me } = await this.ctx();
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)), say: CARRY_SAY };
  }
  // ------------------------------------------------------------ the key in use
  /**
   * Whether the signing key this app holds still counts (the carry Module,
   * 4.5): false once a rotation made elsewhere bound another key.
   */
  async check() {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e2) {
      if (message3(e2) === SPENT_SAY) return { current: false, say: SPENT_SAY };
      throw e2;
    }
  }
  /** Refuse to sign once a rotation counts that this app did not see: the key it holds is spent. */
  async current(me) {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing was signed.");
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }
  /** An act signed and kept: the sequence is saved before anything leaves. */
  async signed(me, f) {
    try {
      return await f();
    } finally {
      await this.store.saveIdentity(me);
    }
  }
  // ------------------------------------------------------------ one's own display name (the naming cMIP)
  /**
   * Publish a display name (the naming cMIP, section 1), then withdraw every
   * other name of this identity under that cMIP found counting (1.3). An
   * empty name withdraws them all.
   */
  setName(typed) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const name = typed.trim() ? readName(typed) : null;
      await this.current(me);
      return this.publishName(me, s, name);
    });
  }
  /** Publish `name` and withdraw every other counting name, for an identity whose key is current. Inside `serial`. */
  async publishName(me, s, name) {
    const hints = [.../* @__PURE__ */ new Set([...s.relays, ...me.f.homes.map((h) => h.hint)])];
    const before = await namesOf(me.id, hints, s.via);
    const lines2 = [];
    const send = async (act) => {
      for (const h of [...me.f.homes.map((x) => x.hint), ...s.relays]) {
        try {
          await relayAt(h, s.via).putAct(act);
        } catch {
        }
      }
    };
    if (name && !before.some((n) => n.name === name)) {
      const made = await this.signed(me, async () => me.sign(SPECS.identity, NAME, namePayload(name), { public: true }));
      await send(made.act);
      lines2.push({ text: `Your display name is \u201C${name}\u201D, shown beside your fingerprint, never instead of it. Anyone may take the same name.`, tone: "ok" });
    }
    for (const old of before.filter((n) => n.name !== name)) {
      const made = await this.signed(me, async () => me.sign(SPECS.identity, NAME_WITHDRAWAL, cborEncode(/* @__PURE__ */ new Map()), { public: true, objects: [[old.act, old.act]] }));
      await send(made.act);
      lines2.push({ text: `\u201C${old.name}\u201D withdrawn: it stays readable as an act, no longer as your name.` });
    }
    const names = (await namesOf(me.id, hints, s.via)).map((n) => n.name);
    this.names.set(me.id, { names, at: now() });
    return { lines: lines2, names };
  }
  // ------------------------------------------------------------ the public side
  /**
   * Post a text, with a JPEG if one is given, then read it back from the
   * relays, verified. `to`, an identity's ID: a public message to it (F287):
   * the post names it and is left, unsealed, in its inbox too. `reply`, a
   * post: this one answers it (it names it in `refs`, with its signer), is
   * addressed to its signer, and left in its inbox where it has one. No
   * private switch here: the private side is its own tab.
   */
  post(a) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const { text: text2, changes } = compose(a.text);
      if (!text2.trim()) throw new Error("Write something to post.");
      const to = [];
      if (a.to?.trim()) {
        let id;
        try {
          id = readId(a.to);
        } catch (e2) {
          throw new Error(`To: ${message3(e2)}. Nothing was posted.`);
        }
        if (id === me.id) throw new Error("To: that is this identity itself. Nothing was posted.");
        let inbox;
        try {
          inbox = (await lookUp(id, hints, s.via)).inbox(SPECS.text);
        } catch (e2) {
          throw new Error(`To: the identity ${fingerprint(id)} was not found: ${message3(e2)}. Nothing was posted.`);
        }
        if (!inbox?.length) throw new Error(`To: the identity ${fingerprint(id)} declares no inbox, so nothing can be left for it. Nothing was posted.`);
        to.push({ id, inbox });
      }
      let refs;
      if (a.reply) {
        const signer = readId(a.reply.signer);
        const id = readId(a.reply.id);
        let act;
        try {
          act = (await followRef([id, signer], [...hints, ...this.inboxPlaces(p)], s.via)).act;
        } catch (e2) {
          throw new Error(`The post answered could not be found: ${message3(e2)}. Nothing was posted.`);
        }
        const d = describeAct(act);
        refs = [[d.id, d.signer]];
        if (d.signer !== me.id && !to.some((t) => t.id === d.signer)) {
          try {
            to.push({ id: d.signer, inbox: (await lookUp(d.signer, hints, s.via)).inbox(SPECS.text) });
          } catch (e2) {
            to.push({ id: d.signer, inbox: null, why: message3(e2) });
          }
        }
      }
      await this.current(me);
      const made = await this.signed(me, () => post(me, { text: text2, jpeg: a.jpeg, relays: s.relays, to: to.length ? to.map((t) => t.id) : void 0, refs }));
      const lines2 = changes.map((c) => ({ text: `Text: ${c}.` }));
      for (const t of to) {
        if (!t.inbox?.length) {
          lines2.push({ text: `${fingerprint(t.id)} declares no inbox${t.why ? ` (${t.why})` : ""}: the reply is published, not left for it.`, tone: "warn" });
          continue;
        }
        const { left, failed } = await leaveInInbox(me, made.act, t.inbox);
        if (left.length) lines2.push({ text: `Left in the inbox of ${fingerprint(t.id)} too, unsealed: anyone may read it.`, tone: "ok" });
        if (failed.length) lines2.push({ text: `Its inbox did not take it at ${failed.map((f) => `${f.relay} (${f.reason})`).join(", ")}.`, tone: left.length ? "warn" : "bad" });
      }
      if (made.picture) {
        lines2.push({
          text: made.picture.removed.length ? `Taken out of the picture before publishing: ${made.picture.removed.map((c) => CARRIED_WORDS[c]).join("; ")}.` : "The picture carried nothing to take out.",
          tone: "ok"
        });
      }
      const shown = await readPost(made.id, hints, s.via);
      return { post: this.item(shown, me.id, p, s, "feed", [], false), lines: lines2 };
    });
  }
  /** A post read and judged, as the page shows it. */
  item(sp, me, p, s, via2, answers, toMe) {
    const pictures = sp.refs.filter((r) => r.kind === "picture").map((r) => ({
      src: r.bytes && r.picture ? `data:image/jpeg;base64,${base64(r.bytes)}` : null,
      width: r.picture?.shownWidth ?? 0,
      height: r.picture?.shownHeight ?? 0,
      publication: r.publication,
      problem: r.problem,
      withdrawable: r.signer === me && sp.signer === me && !r.withdrawn && r.standing === "valid"
    }));
    const doc = sp.format === POST_SPECS.longform ? { title: titleOf(sp.text), link: makeLink(this.opts.reader ?? READER, sp.id, s.relays.filter((r) => /^https:\/\//.test(r))) } : null;
    return {
      id: sp.id,
      who: this.whoFrom(sp.signer, me, p),
      standing: sp.standing,
      text: doc ? "" : sp.text,
      doc,
      pictures,
      answers,
      toMe,
      via: via2,
      problem: sp.standing === "valid" ? null : `not verified: ${sp.standing}`,
      seen: !toMe || p.seen.includes(sp.id)
    };
  }
  /**
   * The feed: this identity's own posts and those of the identities it
   * follows, muted ones left out (the people cMIP, 2.2), read and judged as
   * the site's feed reads them, in signed order (website cMIP, draft 6: MOR
   * has no clock; a reply comes after what it answers). Only text acts and
   * JPEG pictures are shown; a long-form document is named, with a link to
   * the reader.
   */
  async feed() {
    const { me, s, p, hints } = await this.ctx();
    const authors = [me.id, ...p.follows.map((f) => f.id).filter((id) => !p.muted.includes(id))].map((identity) => ({ identity, name: null }));
    const feed = await readFeed(authors, hints, s.via);
    await this.warm([...feed.posts.map((x) => x.signer), ...[...feed.answered.values()].map((x) => x.signer).filter(Boolean)], hints, s.via);
    const items = [];
    for (const fp of feed.posts) {
      if (!fp.post) {
        items.push(this.unread(fp, me.id, p));
        continue;
      }
      const answers = fp.answers.map((id) => {
        const a = feed.answered.get(id);
        return { id, who: a?.signer ? this.whoFrom(a.signer, me.id, p) : null, snippet: a?.post ? snippet(a.post.text) : null };
      });
      const toMe = fp.signer !== me.id && answers.some((x) => x.who?.me);
      items.push(this.item(fp.post, me.id, p, s, "feed", answers, toMe));
    }
    const problems = feed.authors.filter((a) => a.problem).map((a) => `${fingerprint(a.identity)}: ${a.problem}`);
    return { items, more: feed.more, problems };
  }
  unread(fp, me, p) {
    return { id: fp.id, who: this.whoFrom(fp.signer, me, p), standing: "unknown", text: "", doc: null, pictures: [], answers: [], toMe: false, via: "feed", problem: fp.problem, seen: true };
  }
  // ------------------------------------------------------------ the inbox: "to you", and the private side
  inboxPlaces(p) {
    return Object.keys(p.inbox.after);
  }
  /**
   * Read this identity's inbox since last time: everything its inbox relays
   * hold addressed to it, sealed or not; each container opened with its
   * encryption keys, each act judged through its signer's chain. Kept here,
   * so each is read once. Silence proves nothing: what was not delivered to
   * the inbox is not found here.
   */
  async readInbox(me, s, p, hints) {
    const problems = [];
    let inbox = [];
    try {
      const l = await lookUp(me.id, hints, s.via);
      inbox = list2(l.routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints));
    } catch (e2) {
      problems.push(`Its inbox could not be looked up: ${message3(e2)}`);
    }
    if (!inbox.length) {
      problems.push("This identity declares no inbox: nothing addressed to it can be found here.");
      return problems;
    }
    const secrets = [...me.f.encryption].reverse().map((e2) => unhex(e2.secret));
    const looked = /* @__PURE__ */ new Map();
    const judge = async (signer, act, id, key) => {
      let l = looked.get(signer);
      if (!l) looked.set(signer, l = lookUp(signer, hints, s.via));
      try {
        const x = await l;
        if (key) x.verifier.addWithKey(act, key);
        else x.verifier.add(act);
        return x.verifier.status(id);
      } catch (e2) {
        return `its signer was not found (${message3(e2)})`;
      }
    };
    for (const hint of inbox) {
      let after = p.inbox.after[hint];
      try {
        for (; ; ) {
          const page = await relayAt(hint, s.via).feed({ to: me.id, after });
          for (const it of page.items) {
            const k = await this.readItem(it.kind, it.item, me.id, secrets, judge);
            if (k && !p.inbox.items.some((x) => x.key === k.key)) p.inbox.items.push(k);
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
        p.inbox.after[hint] = after ?? 0;
      } catch (e2) {
        problems.push(`${hint}: ${message3(e2)}`);
      }
    }
    await this.store.savePeople(me.id, p);
    return problems;
  }
  async readItem(kind, bytes, me, secrets, judge) {
    let act = bytes;
    let key;
    let d;
    if (kind === "sealed") {
      const open = () => {
        for (const s of secrets) {
          try {
            return openSealed(bytes, me, s);
          } catch {
          }
        }
        return null;
      };
      const opened = open();
      if (!opened) {
        return {
          key: `sealed:${sealedId(bytes)}`,
          kind: "other",
          from: null,
          text: null,
          standing: "unknown",
          refs: [],
          to: [],
          found: now(),
          problem: secrets.length ? "a sealed message that does not open with this identity\u2019s encryption keys" : NO_KEY_SAY
        };
      }
      act = opened.act;
      key = opened.key;
      d = opened.described;
    } else {
      try {
        d = describeAct(bytes);
      } catch {
        return null;
      }
    }
    if (!d.signer || d.signer === me) return null;
    const isText = d.spec === POST_SPECS.text && d.type === TEXT_ACT && !!d.payload;
    let text2 = null;
    if (isText) {
      const t = cborDecode(d.payload).get(0);
      if (typeof t === "string") text2 = t;
    }
    const talk = readMessage(d);
    if (talk) text2 = talk.text;
    return {
      ...talk ? { talk: { thread: talk.thread, previous: talk.previous, acks: talk.acks } } : {},
      key: d.id,
      kind: !isText ? "other" : d.public ? "public" : "private",
      from: d.signer,
      text: text2,
      standing: await judge(d.signer, act, d.id, key),
      refs: (d.refs ?? []).map((id, i) => ({ id, signer: d.refSigners?.[i] ?? null })),
      to: d.to ?? [],
      found: now(),
      problem: d.payload ? void 0 : "a private act whose key was not delivered with it: it cannot be read here"
    };
  }
  /**
   * The inbox, read: on the public side, "to you" (public posts that answer
   * one of this identity's posts or are addressed to it); on the private
   * side, the messages sealed to it, with those sent from here. Muted
   * identities are left out (the people cMIP, 2.2), and counted.
   */
  async inbox() {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const problems = await this.readInbox(me, s, p, hints);
      const shown = p.inbox.items.filter((k) => !k.from || !p.muted.includes(k.from));
      const hidden = p.inbox.items.length - shown.length;
      await this.warm([...shown.map((k) => k.from).filter(Boolean), ...p.sent.map((x) => x.to)], hints, s.via);
      const places = [...hints, ...this.inboxPlaces(p)];
      const toYou = [];
      for (const k of shown.filter((x) => x.kind === "public").sort((a, b) => b.found - a.found).slice(0, 30)) {
        const answers = k.refs.filter((r) => r.signer === me.id || me.f.sequence.includes(r.id));
        if (!answers.length && !k.to.includes(me.id)) continue;
        const ans = answers.map((r) => ({ id: r.id, who: this.whoFrom(me.id, me.id, p), snippet: null }));
        let item;
        try {
          item = this.item(await readPost(k.key, places, s.via), me.id, p, s, "inbox", ans, true);
        } catch {
          item = {
            id: k.key,
            who: this.whoFrom(k.from, me.id, p),
            standing: k.standing,
            text: k.text ?? "",
            doc: null,
            pictures: [],
            answers: ans,
            toMe: true,
            via: "inbox",
            problem: k.standing === "valid" ? null : `not verified: ${k.standing}`,
            seen: false
          };
        }
        item.seen = p.seen.includes(k.key);
        toYou.push(item);
      }
      const messages = [
        ...shown.filter((k) => k.kind === "private" || k.kind === "other" && k.key.startsWith("sealed:")).map((k) => ({
          key: k.key,
          who: k.from ? this.whoFrom(k.from, me.id, p) : { id: "", short: "unknown", names: [], pet: null, me: false, followed: false, muted: false },
          dir: "in",
          text: k.text ?? "",
          standing: k.standing,
          at: k.found,
          seen: p.seen.includes(k.key),
          problem: k.problem ?? (k.standing === "valid" ? null : `not verified: ${k.standing}`)
        })),
        ...p.sent.map((x) => ({ key: x.id, who: this.whoFrom(x.to, me.id, p), dir: "out", text: x.text, standing: "valid", at: x.at, seen: true, problem: null }))
      ].sort((a, b) => b.at - a.at);
      return { toYou, messages, encryption: me.f.encryption.length > 0, hidden, problems };
    });
  }
  /**
   * A private message (F293): a private text act addressed to one identity,
   * sealed to its current encryption key and left in its inbox. Only it can
   * open it. Kept here as sent; the act itself, locked, goes to this
   * identity's homes too, so this app's line can be rebuilt by whoever
   * changes its keys (Identity rule 35), and it shows only that a private act
   * exists.
   */
  message(a) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      let to;
      try {
        to = readId(a.to);
      } catch (e2) {
        throw new Error(`To: ${message3(e2)}. Nothing was sent.`);
      }
      if (to === me.id) throw new Error("To: that is this identity itself. Nothing was sent.");
      const { text: text2 } = compose(a.text);
      if (!text2.trim()) throw new Error("Write something to send.");
      let l;
      try {
        l = await lookUp(to, hints, s.via);
      } catch (e2) {
        throw new Error(`To: the identity ${fingerprint(to)} was not found: ${message3(e2)}. Nothing was sent.`);
      }
      if (!l.encryptionKey) throw new Error(`To: the identity ${fingerprint(to)} has published no encryption key, so nothing can be sealed to it. Nothing was sent.`);
      const inbox = l.inbox(SPECS.text);
      if (!inbox?.length) throw new Error(`To: the identity ${fingerprint(to)} declares no inbox. Nothing was sent.`);
      await this.current(me);
      const made = await this.signed(me, async () => me.sign(SPECS.text, TEXT_ACT, textPayload(text2), { public: false, to: [to] }));
      const sealed = sealFor(made.act, made.key, [{ id: to, key: l.encryptionKey }]);
      const lines2 = [];
      let left = 0;
      for (const h of inbox) {
        try {
          await relayAt(h, s.via).putSealed(sealed);
          left++;
        } catch (e2) {
          lines2.push({ text: `${h} did not take it: ${message3(e2)}`, tone: "warn" });
        }
      }
      if (!left) throw new Error(`No inbox of ${fingerprint(to)} took the message: ${lines2.map((x) => x.text).join("; ")}. It is signed, not delivered.`);
      for (const h of me.f.homes) {
        try {
          await relayAt(h.hint, s.via).putAct(made.act);
        } catch {
        }
      }
      p.sent.push({ id: made.id, to, text: text2, at: now() });
      await this.store.savePeople(me.id, p);
      lines2.unshift({ text: `Sealed to ${fingerprint(to)} and left in its inbox: only it can open it.`, tone: "ok" });
      return { lines: lines2 };
    });
  }
  /** Mark what the person has seen, for the counts on the tabs. */
  // ------------------------------------------------------------ the Signing tab (H18)
  /** Turn the Signing tab on or off for the identity in use (off by default, F59). */
  setSigning(on) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.saveSettings(me.id, { ...s, signing: on });
      return { lines: [{ text: on ? `Signing is on. ${SIGNING_SAY}` : "Signing is off. Proposals wait in your inbox, unread, until it is on again.", tone: on ? "warn" : void 0 }] };
    });
  }
  /** How this app names an identity in a reading: the name given here or its display name, beside its fingerprint; "you" for itself. */
  namer(me, p) {
    return (id) => {
      const w = this.whoFrom(id, me, p);
      const n = w.pet ?? w.names[0] ?? null;
      return `${id === me ? "you" : n ? n : "an identity"} [${w.short}]`;
    };
  }
  /** The proposals in this identity's inbox (negotiation messages opening a thread), each read in plain words; or, with Signing off, how many wait. */
  proposals() {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const problems = await this.readInbox(me, s, p, hints);
      const firsts = p.inbox.items.filter((k) => k.talk && k.talk.thread === k.key && k.from && k.from !== me.id && !p.muted.includes(k.from) && k.refs.length);
      if (!s.signing) return { on: false, waiting: firsts.length, proposals: [], problems, say: SIGNING_OFF_SAY };
      const st = await this.store.signing(me.id);
      await this.warm(firsts.map((k) => k.from), hints, s.via);
      const names = this.namer(me.id, p);
      const out = [];
      for (const k of firsts.sort((a, b) => b.found - a.found)) {
        const act = k.refs[0].id;
        const signer = k.refs[0].signer;
        const places = [.../* @__PURE__ */ new Set([...hints, ...await this.placesOf(signer ?? k.from, hints, s.via)])];
        const laterKept = p.inbox.items.filter((x) => x.talk?.thread === k.key && x.key !== k.key && x.from === k.from);
        const later = laterKept.map((x) => x.text ?? "");
        let reading = null;
        let problem = null;
        try {
          const got = await fetchAct2(act, places, s.via);
          if (!got) problem = `The act it asks you to sign (${act}) was not found at ${places.join(", ")}.`;
          else reading = await readProposal(got.act, names, places, s.via);
        } catch (e2) {
          problem = `It could not be read: ${message3(e2)}`;
        }
        const ans = st.answered[k.key] ?? null;
        const w = st.waiting[k.key];
        const r = st.received[k.key];
        let share2 = "none";
        if (r) share2 = r.byHand ? "byHand" : "received";
        else if (w?.shown) share2 = "shown";
        else if (w) {
          try {
            share2 = await openShare(unhex(w.secret), places, places, s.via) ? "ready" : "waiting";
          } catch {
            share2 = "waiting";
          }
        }
        out.push({
          thread: k.key,
          from: this.whoFrom(k.from, me.id, p),
          text: k.text ?? "",
          later,
          act,
          collective: this.collectiveOf(p, k.key) ?? reading?.collective ?? null,
          reading: reading ? { kind: reading.kind, title: reading.title, summary: reading.summary, sections: reading.sections, plain: reading.plain, risks: reading.risks, blocking: reading.blocking } : null,
          problem,
          answer: ans ? { verdict: ans.verdict, signature: ans.signature } : null,
          share: share2,
          positions: w?.shown ?? null,
          seen: p.seen.includes(k.key)
        });
      }
      return { on: true, waiting: firsts.filter((k) => !st.answered[k.key]).length, proposals: out, problems, say: SIGNING_SAY };
    });
  }
  /** The collective a thread is about, as the proposer's messages in it name it (their second reference). */
  collectiveOf(p, thread) {
    for (const x of p.inbox.items) if (x.talk?.thread === thread && x.refs[1]) return x.refs[1].id;
    return null;
  }
  /** Where an identity's acts are: its homes and the relays its routes name. */
  async placesOf(id, hints, via2) {
    try {
      const l = await lookUp(id, hints, via2);
      return [...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)];
    } catch {
      return [];
    }
  }
  /** The proposal a thread opens, from the inbox as read, with the act it names fetched again. */
  async proposal(me, s, p, hints, thread) {
    if (!s.signing) throw new Error(SIGNING_OFF_SAY);
    const k = p.inbox.items.find((x) => x.key === thread && x.talk?.thread === thread && x.from && x.refs.length);
    if (!k) throw new Error("No such proposal in this identity\u2019s inbox.");
    const act = k.refs[0].id;
    const places = [.../* @__PURE__ */ new Set([...hints, ...await this.placesOf(k.refs[0].signer ?? k.from, hints, s.via)])];
    const got = await fetchAct2(act, places, s.via);
    if (!got) throw new Error(`The act it asks you to sign (${act}) was not found. Nothing was signed.`);
    const reading = await readProposal(got.act, this.namer(me.id, p), places, s.via);
    const collective = k.refs[1]?.id ?? reading.collective;
    return { k, act, places, reading, collective, proposer: k.from };
  }
  /**
   * Sign what a proposal names, as read (Agreements rule 4): the member's own
   * signature act, public, at this identity's relays, where the act was
   * found and, for a collective's clone or release, at the collective's
   * homes; then the answer to the proposer, a negotiation message in its
   * thread, acknowledging it. For a founding or a member change, the answer
   * carries the public half of a one-time key made for this share alone
   * (H18), whose secret is held here until the share is shown and written
   * down.
   */
  signProposal(thread) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      if (st.answered[thread]) throw new Error(`You already ${st.answered[thread].verdict} it. Nothing more was signed.`);
      const { act, places, reading, collective, proposer } = await this.proposal(me, s, p, hints, thread);
      if (reading.blocking.length) throw new Error(`It cannot be signed here: ${reading.blocking.join(" ")} Nothing was signed.`);
      await this.current(me);
      const where = [.../* @__PURE__ */ new Set([...s.relays, ...places, ...collective ? await this.placesOf(collective, hints, s.via) : []])];
      const made = await this.signed(me, () => sign(me, act, where));
      const lines2 = [{ text: `Signed: your signature act ${made.id} is published at ${where.join(", ")}.`, tone: "ok" }];
      let oneTime;
      if (reading.kind === "founding" || reading.kind === "clone") {
        const k = TestIdentity.newBareKey();
        oneTime = k.public;
        st.waiting[thread] = { secret: hex(k.secret), since: now(), act };
        lines2.push({ text: "A one-time key was made for your share of the collective\u2019s chain key: its secret stays in this app only until the share arrives and you have written it down, then it is destroyed." });
      }
      st.answered[thread] = { act, verdict: "signed", signature: made.id, reply: "", at: now() };
      await this.store.saveSigning(me.id, st);
      const reach = await this.reach(proposer, hints, s.via);
      const reply = await this.signed(me, () => negotiate(me, reach, { text: acceptanceText(made.id, oneTime), thread, previous: this.lastFrom(p, thread, proposer), acks: [this.lastFrom(p, thread, proposer)] }));
      st.answered[thread].reply = reply.id;
      await this.store.saveSigning(me.id, st);
      lines2.push({ text: reply.left.length ? `Your answer was left in the proposer\u2019s inbox (${reply.left.join(", ")}).` : `Your answer could not be left in the proposer\u2019s inbox: ${reply.failed.map((f) => `${f.relay}: ${f.reason}`).join("; ")}.`, tone: reply.left.length ? void 0 : "bad" });
      return { lines: lines2, signature: made.id };
    });
  }
  /** Decline a proposal: a negotiation message in its thread saying so; nothing is signed for it. */
  declineProposal(thread, why = "") {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      if (st.answered[thread]) throw new Error(`You already ${st.answered[thread].verdict} it.`);
      const k = p.inbox.items.find((x) => x.key === thread && x.talk?.thread === thread && x.from);
      if (!k) throw new Error("No such proposal in this identity\u2019s inbox.");
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      await this.current(me);
      const reach = await this.reach(k.from, hints, s.via);
      const last = this.lastFrom(p, thread, k.from);
      const reply = await this.signed(me, () => negotiate(me, reach, { text: why.trim() ? `${DECLINED}
${compose(why).text}` : DECLINED, thread, previous: last, acks: [last] }));
      st.answered[thread] = { act: k.refs[0]?.id ?? "", verdict: "declined", reply: reply.id, at: now() };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: "Declined: nothing was signed, and the proposer was told." }] };
    });
  }
  /** The latest message of the other side in a thread, as this app read it: what an answer follows and acknowledges. */
  lastFrom(p, thread, from) {
    const theirs = p.inbox.items.filter((x) => x.talk?.thread === thread && x.from === from);
    const ids = new Set(theirs.map((x) => x.key));
    return theirs.find((x) => !theirs.some((y) => y.talk?.previous === x.key && ids.has(y.key)))?.key ?? thread;
  }
  async reach(id, hints, via2) {
    const l = await lookUp(id, hints, via2);
    if (!l.encryptionKey) throw new Error("The proposer has published no encryption key: no answer can be sealed to it. Nothing was sent.");
    const inbox = l.inbox(REPO_SPECS.agreements) ?? l.inbox(POST_SPECS.text);
    if (!inbox?.length) throw new Error("The proposer declares no inbox. Nothing was sent.");
    return { id, key: l.encryptionKey, inbox };
  }
  /** Open the share waiting for a thread with its one-time key. */
  async shareFor(me, s, hints, thread) {
    const st = await this.store.signing(me.id);
    const w = st.waiting[thread];
    if (!w) throw new Error("No share is waiting for this proposal here.");
    const places = [.../* @__PURE__ */ new Set([...hints, ...await this.inboxOf(me.id, hints, s.via)])];
    const got = await openShare(unhex(w.secret), places, places, s.via);
    if (!got) throw new Error("The share has not arrived yet: the founder\u2019s Edubba sends it once every member has signed.");
    const paper = shareOnPaper(got.share);
    return { st, w, paper };
  }
  async inboxOf(id, hints, via2) {
    try {
      return list2((await lookUp(id, hints, via2)).routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints));
    } catch {
      return [];
    }
  }
  /**
   * Show a member's share once (H18): its number and 24 words, labelled as
   * the collective's chain key share, checked against the dealing first.
   * From then on it is never shown again; three of its words are asked back
   * (as H3), and only then is the one-time key destroyed.
   */
  shareShow(thread) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      const { st, w, paper } = await this.shareFor(me, s, hints, thread);
      if (w.shown) throw new Error("It was shown once already: type back the three words asked.");
      const positions = threePositions(randomBelow);
      w.shown = positions;
      await this.store.saveSigning(me.id, st);
      return {
        thread,
        x: paper.x,
        holders: paper.holders,
        threshold: paper.threshold,
        words: toWords(paper.value),
        fingerprint: paper.fingerprint.match(/.{1,4}/g).slice(0, 8).join(" "),
        collective: this.collectiveOf(p, thread),
        say: SHARE_SAY,
        positions
      };
    });
  }
  /** Three words of the share typed back: then the one-time key is destroyed, and the relays' copy can never be opened again. */
  shareConfirm(thread, typed) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const { st, w, paper } = await this.shareFor(me, s, hints, thread);
      if (!w.shown) throw new Error("The share has not been shown yet.");
      if (!typedBack(toWords(paper.value), w.shown, typed)) {
        throw new Error(`Those are not words ${w.shown.join(", ")} of your share as shown. Look at what you wrote down. The one-time key is kept until they are.`);
      }
      delete st.waiting[thread];
      st.received[thread] = { x: paper.x, fingerprint: paper.fingerprint, collective: this.collectiveOf(p, thread), at: now() };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: `Share ${paper.x} is written down. The one-time key is destroyed: the copy on the relays can never be opened again, by anyone. Keep the paper safe.`, tone: "ok" }] };
    });
  }
  /** The share came by hand, shown on the founder's screen: the one-time key is destroyed unused. */
  shareByHand(thread) {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const st = await this.store.signing(me.id);
      const w = st.waiting[thread];
      if (!w) throw new Error("No share is waiting for this proposal here.");
      delete st.waiting[thread];
      st.received[thread] = { x: 0, fingerprint: "", collective: null, at: now(), byHand: true };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: "The one-time key is destroyed: a share sealed to it later could never be opened." }] };
    });
  }
  async seen(keys) {
    await this.serial(async () => {
      const { me, p } = await this.ctx();
      p.seen = [.../* @__PURE__ */ new Set([...p.seen, ...keys])];
      await this.store.savePeople(me.id, p);
    });
  }
  // ------------------------------------------------------------ follow and mute (the people cMIP)
  async people(f) {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      f(p, me);
      await this.store.savePeople(me.id, p);
      const lines2 = [];
      if (p.list === "published") lines2.push(...await this.publishList(me, s, p, false));
      return { lines: lines2 };
    });
  }
  /** Follow an identity, by its ID or the signer of an act shown; a name for it, if given, stays in this app. */
  follow(a) {
    const id = readId(a.id);
    const name = a.name?.trim() ? a.name.trim().slice(0, 64) : null;
    return this.people((p, me) => {
      if (id === me.id) throw new Error("That is this identity itself: its own posts are always in its feed.");
      const f = p.follows.find((x) => x.id === id);
      if (f) f.name = name ?? f.name;
      else p.follows.push({ id, name });
    });
  }
  unfollow(id) {
    return this.people((p) => {
      p.follows = p.follows.filter((x) => x.id !== id);
    });
  }
  /** Your own name for an identity you follow: in this app only, never published. */
  callIt(a) {
    return this.people((p) => {
      const f = p.follows.find((x) => x.id === a.id);
      if (!f) throw new Error("Follow it first.");
      f.name = a.name.trim() ? a.name.trim().slice(0, 64) : null;
    });
  }
  /** Mute an identity: nothing of it is shown here. Never published, never told. */
  async mute(id) {
    const x = readId(id);
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      if (x === me.id) throw new Error("That is this identity itself.");
      if (!p.muted.includes(x)) p.muted.push(x);
      await this.store.savePeople(me.id, p);
      return { lines: [] };
    });
  }
  async unmute(id) {
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      p.muted = p.muted.filter((m) => m !== id);
      await this.store.savePeople(me.id, p);
      return { lines: [] };
    });
  }
  /**
   * The follow list's option (the people cMIP, 1.3): private (the default)
   * or published. Published is chosen only with the warning shown, word for
   * word (3.5); back to private publishes one last, empty, withdrawn version
   * (3.4).
   */
  listOption(a) {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      if (a.published === (p.list === "published")) return { lines: [] };
      if (a.published && a.shown !== PUBLISH_WARNING) throw new Error("The follow list is published only once its warning was shown. Nothing was signed.");
      const lines2 = await this.publishList(me, s, p, !a.published);
      p.list = a.published ? "published" : "private";
      await this.store.savePeople(me.id, p);
      return { lines: lines2 };
    });
  }
  async publishList(me, s, p, withdrawn) {
    await this.current(me);
    let last = p.published;
    try {
      const found = await readFollowList(me.id, s.relays, s.via);
      if (found.act && found.version >= (last?.version ?? 0)) last = { version: found.version, act: found.act };
    } catch {
    }
    const version = (last?.version ?? 0) + 1;
    const payload = followListPayload({ version, previous: last?.act ?? null, ids: p.follows.map((f) => f.id), withdrawn });
    const made = await this.signed(me, async () => me.publish(PEOPLE_SPEC, FOLLOW_LIST, payload, { public: true, relays: s.relays }));
    p.published = { version, act: made.id };
    await this.store.savePeople(me.id, p);
    return [
      withdrawn ? { text: `The follow list is private again: a last, empty version (${version}) says so. What was published stays published.`, tone: "warn" } : { text: `The follow list is published (version ${version}): ${p.follows.length} identit${p.follows.length === 1 ? "y" : "ies"}, by ID only. The names you gave them stay here.`, tone: "ok" }
    ];
  }
  // ------------------------------------------------------------ pictures
  /** Withdraw a picture this identity published (Envelopes, "Withdrawal"): readers stop showing it; the post stands. */
  withdraw(publication) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (!/^[0-9a-f]{64}$/.test(publication)) throw new Error("not a publication id");
      let act = null;
      for (const r of s.relays) {
        try {
          act = await relayAt(r, s.via).getAct(publication);
          if (act) break;
        } catch {
        }
      }
      if (!act) throw new Error("That picture was not found at the relays.");
      if (describeAct(act).signer !== me.id) throw new Error("That picture was published by another identity: only its signer can withdraw it.");
      await this.current(me);
      return this.signed(me, () => withdraw(me, publication, s.relays));
    });
  }
};
function titleOf(text2) {
  const first = text2.split("\n").find((l) => l.trim()) ?? "";
  return first.replace(/^#+\s*/, "").trim().slice(0, 120) || "A document";
}
function snippet(text2) {
  const one = text2.replace(/\s+/g, " ").trim();
  return one.length > 80 ? `${one.slice(0, 79)}\u2026` : one;
}

// src/ops.ts
var text = (v) => typeof v === "string" ? v : "";
var list3 = (v) => Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : [];
async function run(dub2, op, a, p) {
  switch (op) {
    case "state":
      return dub2.state();
    case "begin":
      return dub2.begin({ homes: list3(a.homes), relays: list3(a.relays), via: p.via(a.via), name: text(a.name) });
    case "confirm":
      return dub2.confirm(list3(a.typed));
    case "abandon":
      await dub2.abandon();
      return {};
    case "bring":
      return dub2.bring({ id: text(a.id), words: text(a.words), address: text(a.address), relays: list3(a.relays), via: p.via(a.via) });
    case "renew":
      return dub2.renew(text(a.words));
    case "use":
      await dub2.use(text(a.id));
      return {};
    case "forget":
      await dub2.forget(text(a.id));
      return {};
    case "carry":
      return dub2.carry();
    case "check":
      return dub2.check();
    case "name":
      return dub2.setName(text(a.name));
    case "post": {
      const reply = a.reply && typeof a.reply === "object" ? a.reply : null;
      return dub2.post({
        text: text(a.text),
        jpeg: text(a.jpeg) ? p.bytes(text(a.jpeg)) : void 0,
        to: text(a.to),
        reply: reply ? { id: text(reply.id), signer: text(reply.signer) } : void 0
      });
    }
    case "feed":
      return dub2.feed();
    case "inbox":
      return dub2.inbox();
    case "message":
      return dub2.message({ to: text(a.to), text: text(a.text) });
    case "seen":
      await dub2.seen(list3(a.keys));
      return {};
    case "follow":
      return dub2.follow({ id: text(a.id), name: text(a.name) });
    case "unfollow":
      return dub2.unfollow(text(a.id));
    case "call":
      return dub2.callIt({ id: text(a.id), name: text(a.name) });
    case "mute":
      return dub2.mute(text(a.id));
    case "unmute":
      return dub2.unmute(text(a.id));
    case "list":
      return dub2.listOption({ published: a.published === true, shown: text(a.shown) });
    case "withdraw":
      return dub2.withdraw(text(a.publication));
    case "signing":
      return dub2.setSigning(a.on === true);
    case "proposals":
      return dub2.proposals();
    case "accept":
      return dub2.signProposal(text(a.thread));
    case "decline":
      return dub2.declineProposal(text(a.thread), text(a.why));
    case "share":
      return dub2.shareShow(text(a.thread));
    case "shareback":
      return dub2.shareConfirm(text(a.thread), list3(a.typed));
    case "sharehand":
      return dub2.shareByHand(text(a.thread));
    default:
      throw new Error(`unknown operation ${op}`);
  }
}

// ../manage/src/view.ts
function e(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// src/page/view.ts
var NAME2 = "Dub";
var TEST_ONLY = "Test identities only, until MOR is frozen";
var WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. Two risks, in plain words:</p>
<ol><li>Whoever serves this page's code at the moment an identity is made here could copy its keys.</li>
<li>This browser's storage, where the identity's signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div>`;
var KEPT_SAY = "Its signing key and its encryption key are kept in this browser\u2019s storage (IndexedDB), as they are, not locked: the only lock this page could put on them is one it could open by itself, and so could whatever else runs in this page. Its signing key\u2019s words are the way out: write them down.";
var note = (kind, html) => `<div class="note ${kind}">${html}</div>`;
var lines = (ls) => `<ul>${ls.map((l) => `<li class="${e(l.tone ?? "")}">${e(l.text)}</li>`).join("")}</ul>`;
function who(w) {
  const dn = w.names.length ? w.names.map((n) => `\u201C${e(n)}\u201D`).join(" / ") : "";
  const first = w.pet ? `<span class="name" dir="auto">${e(w.pet)}</span>${dn ? `<span class="dn" dir="auto" title="its display name">${dn}</span>` : ""}` : dn ? `<span class="name" dir="auto">${dn.replace(/“|”/g, "")}</span>` : "";
  return `<span class="who">${first}<span class="fp" title="${e(w.id)}">${e(w.short)}</span>${w.me ? '<span class="you">you</span>' : ""}</span>`;
}
function testNotice(web) {
  return web ? "" : `<div class="banner" id="test-only">${TEST_ONLY}. Every key is held in software in this program's folder: a prototype, never for a real identity.</div>`;
}
function top(web = false, back = false) {
  return `<header class="bar"><h1 class="mark">${NAME2}</h1><span class="grow"></span>${back ? '<button class="quiet" data-action="back">Back to Dub</button>' : `<span class="small">${web ? "web client, for testing only" : "this machine only"}</span>`}</header>
${testNotice(web)}`;
}
var via = `<details><summary>Another way to reach an address (rarely needed)</summary>
<label>One per line, as address=where (for example an onion home at its local port)</label><textarea name="via"></textarea></details>`;
function identityWindow(s, web = false, suggested2 = {}) {
  const i = s.identity;
  const others = s.held.filter((h) => !h.active);
  const lns = (xs) => e((xs ?? []).join("\n"));
  const make = `<section class="card"><h3>Make a new identity</h3>
<p class="small">Dub makes it here and shows you 24 words, once: the chain key\u2019s words, to write on paper. Dub keeps nothing of the chain key. Its signing key stays in ${web ? "this browser" : "this app"}.</p>
<form id="begin">
<label>Its home, where anyone can check it (one address per line)</label><textarea name="homes" required placeholder="https://">${lns(suggested2.homes)}</textarea>
<label>Relays for its posts and its inbox (one per line; empty: its home)</label><textarea name="relays">${lns(suggested2.relays)}</textarea>
<label>A display name, if you like: published right after it is made, shown beside its fingerprint, never instead of it. Anyone can take the same name.</label><input name="name" type="text" maxlength="48" autocomplete="off" placeholder="No name: its fingerprint alone">
${web ? "" : via}
<div class="row"><button type="submit" class="primary">Make it</button></div></form></section>`;
  const bring = `<section class="card"><h3>Bring an identity you have</h3>
<p class="small">Its ID and its signing key\u2019s words. Dub reads it from its homes and checks the words give its current signing key.</p>
<form id="bring">
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its signing key\u2019s 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" type="text" placeholder="https://" required>
<label>Relays for its posts (only if it names none; one per line)</label><textarea name="relays"></textarea>
${web ? "" : via}
<p class="small">Never type the chain key\u2019s words here: they belong to MOR Safety, on a device that stays offline.${web ? ` ${e(KEPT_SAY)}` : ""}</p>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>`;
  const doors = i ? `<details id="doors"><summary>Another identity: make one, or bring one</summary>${make}${bring}</details>` : `${make}${bring}`;
  const browsers = web ? "" : `<details><summary>Browsers paired with this app</summary><div class="row"><button data-action="code">A code for another browser on this machine</button><button class="quiet" data-action="unpair">Unpair this browser</button></div><div id="code"></div></details>`;
  return `${top(web, !!i)}
<div id="status"></div>
<h2>Identity</h2>
${i ? current(s) : '<p class="small">Dub opens once an identity is here.</p>'}
${others.length ? `<div class="held"><span class="label">Also here</span><ul>${others.map((h) => `<li>${who(h.who)}<button data-action="use" data-id="${e(h.id)}">Use this one</button></li>`).join("")}</ul></div>` : ""}
${doors}
${browsers}`;
}
function current(s) {
  const i = s.identity;
  const name = i.who.names.join(" / ");
  return `<div class="card" id="identity">
<span class="label">In use</span>
<p>${who(i.who)}</p>
<p class="id">${e(i.grouped)}</p>
<div class="row"><button class="quiet" data-action="copy" data-id="${e(i.id)}">Copy ID</button></div>
<form id="name"><label>Your display name: shown beside your fingerprint, never instead of it. Anyone can take the same name.</label>
<div class="row"><input class="grow" name="name" maxlength="48" autocomplete="off" value="${e(name)}" placeholder="No name: your fingerprint alone"><button type="submit">Save</button></div></form>
<div class="row"><label class="small check"><input type="checkbox" id="signing-on" ${i.signing ? "checked" : ""}> Signing: sign agreements of real collectives here. Even more experimental than Dub itself; off unless you turn it on.</label></div>
<div class="row"><button data-action="carry">Show the signing key\u2019s words</button><button class="quiet" data-action="forget" data-id="${e(i.id)}">Forget it here</button></div>
<div id="carry"></div>
<details><summary>This app\u2019s line, and where it lives</summary>
<dl class="facts"><dt>Made</dt><dd>${i.kind === "made" ? "Here. Its chain key was shown once as words, and is kept nowhere here." : "Elsewhere, brought here by its signing key\u2019s words. Its chain key is not here."}</dd>
${i.oldChainKey ? "<dt>Old chain key</dt><dd>Made by Dub before 16 October 2026: its chain key is still in this app\u2019s folder, unused. MOR Safety will take it from there.</dd>" : ""}
<dt>Private messages</dt><dd>${i.encryption ? "Its encryption key is here: its private messages open here." : "No encryption key here: its private messages cannot be opened here."}</dd>
<dt>Homes</dt><dd>${e(i.homes.join(", "))}</dd>
<dt>Relays</dt><dd>${e(i.relays.join(", "))}</dd>
<dt>This app's line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? "" : "s"}${i.line.latest ? `; latest <code>${e(i.line.latest)}</code>, position ${i.line.acts}, summary <code>${e(i.line.summary ?? "")}</code>` : ""}</dd></dl>
<p class="small">If the signing key is ever changed (in MOR Safety, with the chain key\u2019s words), that change must keep this line, or the posts made here become void: take the line above to it.</p></details>
</div>`;
}
function words(ws, say, web = false) {
  return `${top(web)}
<h2>The chain key\u2019s words</h2>
<ul class="say">${say.map((s) => `<li>${e(s)}</li>`).join("")}</ul>
<div class="words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>
<div class="row"><button class="primary" data-action="written">I have written them down</button><button class="quiet" data-action="abandon">Start again</button></div>
<p class="small">Once you go on, the words are hidden, and three of them are asked back.</p>`;
}
function typeBack(positions, web = false) {
  return `${top(web)}
<div id="status"></div>
<h2>Three of the chain key\u2019s words</h2>
<p class="small">From what you wrote down. Nothing is published until these three are right.</p>
<form id="confirm"><div class="typed">${positions.map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`).join("")}</div>
<div class="row"><button type="submit" class="primary">Go on</button><button type="button" class="quiet" data-action="abandon">Start again with a new identity</button></div></form>`;
}
function carry(c) {
  return `<div class="card"><span class="label">The signing key\u2019s words</span>
<p class="id">${e(c.grouped)}</p>
<ul class="say">${c.say.map((s) => `<li>${e(s)}</li>`).join("")}</ul>
<div class="words" id="carry-words">${c.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>
<div class="row"><button data-action="hide-carry">Hide them</button></div></div>`;
}
function app(s, web = false) {
  const i = s.identity;
  return `<header class="bar"><h1 class="mark">${NAME2}</h1>
<nav class="tabs"><button class="tab on" data-tab="public">Public<span class="count" id="count-public"></span></button><button class="tab" data-tab="private">Private<span class="count" id="count-private"></span></button>${i.signing ? '<button class="tab" data-tab="signing">Signing<span class="count" id="count-signing"></span></button>' : ""}</nav>
<button class="me" data-action="window" title="The identity window">${who(i.who)}</button></header>
${testNotice(web)}
<div id="spent"></div>
<div id="status"></div>
<section id="public">
<form id="post" class="compose">
<div id="replying"></div>
<textarea name="text" required placeholder="Write something public"></textarea>
<div class="to"><input name="to" autocomplete="off" spellcheck="false" placeholder="To an identity: its ID (a public message, left in its inbox too)"></div>
<div class="row"><label class="quiet-file"><input name="picture" type="file" accept=".jpg,.jpeg,image/jpeg"><span class="small" data-action="pick">Picture</span></label><button type="button" class="quiet" data-action="address">To\u2026</button><span class="grow small" id="picked"></span><button type="submit" class="primary">Post</button></div>
</form>
<div class="filters"><button class="tab on" data-filter="all">Everyone</button><button class="tab" data-filter="toyou">To you<span class="count" id="count-toyou"></span></button><span class="grow"></span><button class="quiet" data-action="feed">Look again</button></div>
${people(s)}
<div id="feed"><p class="empty">Reading the feed\u2026</p></div>
</section>
<section id="private" hidden>
<form id="message" class="compose">
<input name="to" autocomplete="off" spellcheck="false" placeholder="To: an identity\u2019s ID" required>
<textarea name="text" required placeholder="Write something private"></textarea>
<div class="row"><span class="grow small">Sealed to them: only they can open it.</span><button type="submit" class="primary">Send</button></div>
</form>
${i.encryption ? "" : `<div class="note">No encryption key for this identity is here, so its private messages cannot be opened here: it was brought by words that do not carry the one it publishes.</div>`}
<div id="signing-waiting"></div>
<div id="inbox"><p class="empty">Reading the inbox\u2026</p></div>
</section>
${i.signing ? `<section id="signing" hidden>
<div class="experimental"><strong>Even more experimental</strong>${e(SIGNING_LABEL.slice("Even more experimental".length))}</div>
<div id="signing-list"><p class="empty">Reading the proposals\u2026</p></div>
</section>` : ""}`;
}
var SIGNING_LABEL = "Even more experimental than Dub itself. Here you sign agreements for real collectives: founding one, changing its members, its releases. A signature binds you, and it is public. Read every proposal in full before signing; when in doubt, decline.";
var STATE_OF = { signed: "Signed by you", declined: "Declined" };
function proposal(p) {
  const r = p.reading;
  const head = `<h3>${e(r?.title ?? "A proposal")}</h3><p class="small">From ${who(p.from)}${p.collective ? `, for the collective <span class="fp" title="${e(p.collective)}">${e(p.collective.slice(0, 8))}\u2026${e(p.collective.slice(-4))}</span>` : ""}. Act <span class="fp" title="${e(p.act)}">${e(p.act.slice(0, 8))}\u2026${e(p.act.slice(-4))}</span>.</p>
<p class="small">Their words with it:</p><div class="plain">${e(p.text)}</div>${p.later.map((t) => `<div class="plain">${e(t)}</div>`).join("")}`;
  if (!r) return `<div class="proposal" data-thread="${e(p.thread)}">${head}${note("error", e(p.problem ?? "It could not be read."))}</div>`;
  const body = `${r.summary.map((x) => `<p>${e(x)}</p>`).join("")}
${r.sections.map((x) => `<h4>${e(x.heading)}</h4>${lines(x.lines)}`).join("")}
${r.plain.map((x) => `<h4>${e(x.heading)}</h4><p class="small">As plain text, character for character; any invisible control is shown as &lt;U+\u2026&gt;.</p><div class="plain">${e(x.text)}</div>`).join("")}
${r.blocking.length ? note("error", `<strong>It cannot be signed here:</strong>${lines(r.blocking.map((text2) => ({ text: text2 })))}`) : ""}`;
  const share2 = p.share === "none" ? "" : p.share === "waiting" ? `<p class="small">Your share of the collective\u2019s chain key will arrive once every member has signed and the founder\u2019s Edubba deals the key. Its one-time key waits in this app until then.</p><div class="row"><button class="quiet" data-action="sharehand" data-thread="${e(p.thread)}">I received my share by hand</button></div>` : p.share === "ready" ? `<div class="row"><button class="primary" data-action="share" data-thread="${e(p.thread)}">Show my share of the chain key, once</button></div>` : p.share === "shown" ? shareTypeBack(p.thread, p.positions ?? []) : p.share === "byHand" ? '<p class="small">Your share came by hand. The one-time key is destroyed.</p>' : '<p class="small">Your share is written down. The one-time key is destroyed: nothing of it is here.</p>';
  const actions = p.answer ? `<p class="state">${e(STATE_OF[p.answer.verdict])}${p.answer.signature ? ` \xB7 signature act <span class="fp" title="${e(p.answer.signature)}">${e(p.answer.signature.slice(0, 8))}\u2026</span>` : ""}</p>` : r.blocking.length ? `<div class="row"><button data-action="decline" data-thread="${e(p.thread)}">Decline</button></div>` : `<div class="row"><button class="primary" data-action="accept" data-thread="${e(p.thread)}">Sign it</button><button data-action="decline" data-thread="${e(p.thread)}">Decline</button></div><p class="small">Your signature is an act of yours, public: it binds you to exactly what is read above.</p>`;
  return `<div class="proposal" data-thread="${e(p.thread)}">${head}${body}${actions}${share2}</div>`;
}
function share(s) {
  return `<div class="proposal" id="share-shown" data-thread="${e(s.thread)}"><span class="label">The collective\u2019s chain key share</span>
<p class="share-number">Share <strong>${s.x}</strong> of ${s.holders}; any ${s.threshold} rebuild the key.${s.collective ? ` Collective <span class="fp" title="${e(s.collective)}">${e(s.collective.slice(0, 8))}\u2026${e(s.collective.slice(-4))}</span>.` : ""}</p>
<ul class="say">${s.say.map((x) => `<li>${e(x)}</li>`).join("")}</ul>
<div class="words" id="share-words">${s.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>
<p class="small">The dealing\u2019s fingerprint, the same for every member: compare it with theirs. <code>${e(s.fingerprint)}</code></p>
<div class="row"><button class="primary" data-action="share-written" data-thread="${e(s.thread)}" data-positions="${e(s.positions.join(","))}">I have written share ${s.x} and its 24 words down</button></div>
<p class="small">Once you go on, the words are hidden, and three of them are asked back.</p></div>`;
}
function shareTypeBack(thread, positions) {
  return `<form class="share-back" data-thread="${e(thread)}"><span class="label">Three words of your share</span><p class="small">From what you wrote down. The one-time key is destroyed only once these are right.</p><div class="typed">${positions.map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`).join("")}</div><div class="row"><button type="submit" class="primary">Check them</button></div></form>`;
}
function people(s) {
  const i = s.identity;
  const row = (w, actions) => `<li>${who(w)}<span class="acts">${actions}</span></li>`;
  return `<details class="people" id="people"><summary>Following ${i.follows.length}${i.muted.length ? ` \xB7 muted ${i.muted.length}` : ""}</summary>
<form id="follow" class="row"><input class="grow" name="id" autocomplete="off" spellcheck="false" placeholder="Follow an identity: its ID" required><input class="pet" name="name" autocomplete="off" placeholder="Your name for it (stays here)"><button type="submit">Follow</button></form>
${i.follows.length ? `<ul>${i.follows.map((f) => row(f, `<button data-action="call" data-id="${e(f.id)}">Name</button><button data-action="unfollow" data-id="${e(f.id)}">Unfollow</button>`)).join("")}</ul>` : '<p class="small">Nobody yet. Follow by ID, or from any post or message.</p>'}
${i.muted.length ? `<span class="label">Muted</span><ul>${i.muted.map((m) => row(m, `<button data-action="unmute" data-id="${e(m.id)}">Unmute</button>`)).join("")}</ul>` : ""}
<div class="row"><label class="small check"><input type="checkbox" id="publish-list" ${i.list === "published" ? "checked" : ""}> Publish whom this identity follows</label></div>
<p class="small">${i.list === "published" ? "Published: anyone can read the IDs it follows. The names you gave them stay here." : "Private, the default: the list stays in this app. Muting is always private."}</p>
</details>`;
}
var bad = (standing) => /void|contest|invalid|stolen/.test(standing);
function post2(p) {
  const flag = p.problem ? `<span class="flag ${bad(p.problem) ? "bad" : ""}">${e(p.problem)}</span>` : "";
  const answers = p.answers.map((a) => `<div class="re">\u21B3 answering ${a.who ? who(a.who) : '<span class="fp">an act not found</span>'}${a.snippet ? ` \xB7 <span dir="auto">${e(a.snippet)}</span>` : ""}</div>`).join("");
  const pics = p.pictures.map(
    (x) => x.src ? `<figure><img src="${e(x.src)}" width="${x.width}" height="${x.height}" alt=""></figure>` : `<figure><figcaption>A picture not shown: ${e(x.problem ?? "unknown")}.</figcaption></figure>`
  ).join("");
  const doc = p.doc ? `<a class="doc" href="${e(p.doc.link)}" target="_blank" rel="noopener noreferrer"><span dir="auto">${e(p.doc.title)}</span><span class="small">A long-form document: open it in the reader</span></a>` : "";
  const acts = [
    `<button data-action="reply">Reply</button>`,
    p.who.me ? "" : p.who.followed ? `<button data-action="unfollow" data-id="${e(p.who.id)}">Following</button>` : `<button data-action="follow" data-id="${e(p.who.id)}">Follow</button>`,
    p.who.me ? "" : `<button data-action="mute" data-id="${e(p.who.id)}">Mute</button>`,
    ...p.pictures.filter((x) => x.withdrawable).map((x) => `<button data-action="withdraw" data-publication="${e(x.publication)}">Withdraw picture</button>`)
  ].join("");
  return `<article class="post" data-post="${e(p.id)}" data-signer="${e(p.who.id)}">
<div class="row tight">${who(p.who)}${flag}</div>${answers}
${p.text ? `<div class="text" dir="auto">${e(p.text)}</div>` : ""}${pics}${doc}
<div class="acts">${acts}</div></article>`;
}
function msg(m) {
  const flag = m.problem ? `<span class="flag ${bad(m.problem) ? "bad" : ""}">${e(m.problem)}</span>` : "";
  const acts = m.dir === "in" && m.who.id ? [
    `<button data-action="answer" data-id="${e(m.who.id)}">Reply</button>`,
    m.who.followed ? "" : `<button data-action="follow" data-id="${e(m.who.id)}">Follow</button>`,
    `<button data-action="mute" data-id="${e(m.who.id)}">Mute</button>`
  ].join("") : "";
  return `<article class="msg ${m.dir}" data-key="${e(m.key)}">
<div class="row tight">${m.dir === "out" ? '<span class="small">to</span>' : ""}${who(m.who)}<span class="sealed">sealed</span>${flag}</div>
${m.text ? `<div class="text" dir="auto">${e(m.text)}</div>` : ""}
${acts ? `<div class="acts">${acts}</div>` : ""}</article>`;
}
function spent(say) {
  return note(
    "spent",
    `<p>${e(say)}</p><form id="renew"><label>The new signing key\u2019s 24 words</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea><div class="row"><button type="submit" class="primary">Use the new words</button></div></form>`
  );
}

// src/page/ui.ts
var SPENT = "This identity\u2019s signing key was changed elsewhere";
function mount(app3, b) {
  const $ = (id) => document.getElementById(id);
  let state = null;
  let feed = [];
  let inbox = null;
  let filter = "all";
  let tab = "public";
  let replying = null;
  let shown = null;
  function say(kind, html) {
    const s = $("status");
    if (s) s.innerHTML = html ? note(kind, html) : "";
    if (html) s?.scrollIntoView({ block: "nearest" });
  }
  async function fail(err) {
    if (b.unpaired?.(err)) {
      void b.start();
      return;
    }
    const m = err instanceof Error ? err.message : String(err);
    if (m.startsWith(SPENT)) {
      await check();
      say("", "");
      return;
    }
    say("error", e(m));
  }
  const fill = (id, html) => {
    const el = $(id);
    if (el) el.innerHTML = html;
  };
  async function busy(words3, f) {
    say("", `<span class="small">${e(words3)}</span>`);
    const was = [...app3.querySelectorAll("button")].map((x) => [x, x.disabled]);
    app3.querySelectorAll("button").forEach((x) => x.disabled = true);
    try {
      return await f();
    } catch (err) {
      await fail(err);
      return void 0;
    } finally {
      for (const [x, d] of was) x.disabled = d;
    }
  }
  function toYou() {
    const out = [...inbox?.toYou ?? []];
    for (const p of feed) if (p.toMe && !out.some((x) => x.id === p.id)) out.push(p);
    return out;
  }
  function counts() {
    const n = (k) => k ? String(k) : "";
    const unseen = toYou().filter((x) => !x.seen).length;
    fill("count-toyou", n(unseen));
    fill("count-public", n(unseen));
    fill("count-private", n((inbox?.messages ?? []).filter((m) => !m.seen).length));
  }
  function drawFeed() {
    const items = filter === "toyou" ? toYou() : feed;
    const empty = filter === "toyou" ? "Nothing addressed to you yet: replies to your posts, and public messages to you, come here." : "Nothing yet. Write something, or follow someone.";
    fill("feed", items.length ? items.map(post2).join("") : `<p class="empty">${empty}</p>`);
  }
  function drawInbox() {
    if (!inbox) return;
    const ms = inbox.messages;
    fill(
      "inbox",
      (ms.length ? ms.map(msg).join("") : '<p class="empty">No private message yet.</p>') + (inbox.hidden ? `<p class="small">${inbox.hidden} from muted identities, not shown.</p>` : "") + inbox.problems.map((p) => `<p class="small">${e(p)}</p>`).join("") + (ms.length ? '<p class="small">In the order this app found or sent them: its own time, not a signed one.</p>' : "")
    );
  }
  async function readFeed2() {
    try {
      const r = await b.ask("feed");
      feed = r.items;
      drawFeed();
      if (r.problems.length) $("feed").insertAdjacentHTML("beforeend", r.problems.map((p) => `<p class="small">${e(p)}</p>`).join(""));
      if (r.items.length) $("feed").insertAdjacentHTML("beforeend", '<p class="small">In signed order: a reply after what it answers. MOR has no clock, so this is not a time.</p>');
    } catch (err) {
      fill("feed", note("error", e(err instanceof Error ? err.message : String(err))));
    }
    counts();
  }
  async function readInbox() {
    try {
      inbox = await b.ask("inbox");
      drawInbox();
      if (filter === "toyou") drawFeed();
    } catch (err) {
      fill("inbox", note("error", e(err instanceof Error ? err.message : String(err))));
    }
    counts();
  }
  async function check() {
    try {
      const c = await b.ask("check");
      fill("spent", c.current ? "" : spent(c.say ?? ""));
    } catch {
    }
  }
  async function seen(keys) {
    if (!keys.length) return;
    try {
      await b.ask("seen", { keys });
      for (const x of [...toYou(), ...inbox?.messages ?? []]) if (keys.includes("key" in x ? x.key : x.id)) x.seen = true;
      for (const x of feed) if (keys.includes(x.id)) x.seen = true;
    } catch {
    }
    counts();
  }
  function setTab(t) {
    if (t === "signing" && !$("signing")) t = "public";
    tab = t;
    app3.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x.dataset.tab === t));
    $("public").hidden = t !== "public";
    $("private").hidden = t !== "private";
    if ($("signing")) $("signing").hidden = t !== "signing";
    if (t === "signing") void readSigning();
    if (t === "private") void seen((inbox?.messages ?? []).filter((m) => !m.seen).map((m) => m.key));
  }
  function setFilter(f) {
    filter = f;
    app3.querySelectorAll("[data-filter]").forEach((x) => x.classList.toggle("on", x.dataset.filter === f));
    drawFeed();
    if (f === "toyou") void seen(toYou().filter((x) => !x.seen).map((x) => x.id));
  }
  async function refresh() {
    const s = await b.ask("state");
    state = s;
    await show(s);
  }
  async function show(s) {
    state = s;
    if (s.stage === "confirm" && shown) {
      app3.innerHTML = typeBack(shown.positions, b.web);
      return;
    }
    if (s.stage === "confirm") {
      app3.innerHTML = typeBack(s.confirm.positions, b.web);
      return;
    }
    if (s.stage === "identity") {
      app3.innerHTML = identityWindow(s, b.web, b.suggested?.() ?? {});
      return;
    }
    app3.innerHTML = app(s, b.web);
    setTab(tab);
    setFilter(filter);
    void check();
    await Promise.all([readFeed2(), readInbox()]);
    await readSigning();
  }
  async function readSigning() {
    try {
      const r = await b.ask("proposals");
      if (!r.on) {
        fill("signing-waiting", r.waiting ? note("", `${r.waiting === 1 ? "A proposal to sign waits" : `${r.waiting} proposals to sign wait`}. ${e(r.say)}`) : "");
        return;
      }
      fill("signing-list", r.proposals.length ? r.proposals.map(proposal).join("") : '<p class="empty">No proposal to sign. When a collective\u2019s founder asks you to sign, it comes here.</p>');
      fill("count-signing", r.waiting ? String(r.waiting) : "");
    } catch (err) {
      fill("signing-list", note("error", e(err instanceof Error ? err.message : String(err))));
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
  app3.addEventListener("change", async (ev) => {
    const el = ev.target;
    if (el.name === "picture") fill("picked", el.files?.[0] ? e(el.files[0].name) : "");
    if (el.id === "signing-on") {
      const on = el.checked;
      if (on && !confirm(SIGNING_LABEL)) {
        el.checked = false;
        return;
      }
      const r = await busy(on ? "Turning Signing on\u2026" : "Turning Signing off\u2026", () => b.ask("signing", { on }));
      if (r) {
        const s = await b.ask("state");
        state = s;
        app3.innerHTML = identityWindow(s, b.web, b.suggested?.() ?? {});
        say(on ? "warn" : "done", lines(r.lines));
      } else el.checked = !on;
      return;
    }
    if (el.id === "publish-list") {
      const on = el.checked;
      if (on && !confirm(PUBLISH_WARNING)) {
        el.checked = false;
        return;
      }
      const r = await busy(on ? "Publishing the follow list\u2026" : "Making the follow list private again\u2026", () => b.ask("list", { published: on, shown: on ? PUBLISH_WARNING : "" }));
      if (r) {
        await refresh();
        say("done", lines(r.lines));
      } else el.checked = !on;
    }
  });
  app3.addEventListener("click", async (ev) => {
    const el = ev.target.closest("[data-action],[data-tab],[data-filter]");
    if (!el || el instanceof HTMLInputElement) return;
    const d = el.dataset;
    if (d.tab) return setTab(d.tab);
    if (d.filter) return setFilter(d.filter);
    const card = el.closest("[data-post]");
    switch (d.action) {
      case "written":
        app3.innerHTML = typeBack(shown.positions, b.web);
        break;
      case "abandon":
        if (!confirm("Forget this new identity? Nothing of it was published. A new one will show new words.")) break;
        shown = null;
        try {
          await b.ask("abandon");
          await b.start();
        } catch (err) {
          await fail(err);
        }
        break;
      case "window":
        if (state) app3.innerHTML = identityWindow(state, b.web, b.suggested?.() ?? {});
        break;
      case "back":
        await refresh();
        break;
      case "use": {
        const r = await busy("Switching\u2026", () => b.ask("use", { id: d.id }));
        if (r) {
          feed = [];
          inbox = null;
          await refresh();
        }
        break;
      }
      case "forget":
        if (!confirm("Forget this identity here? Its keys go with it. Only its signing key\u2019s words, written down, bring it back. Its posts stay published.")) break;
        if (await busy("Forgetting\u2026", () => b.ask("forget", { id: d.id }))) {
          feed = [];
          inbox = null;
          await refresh();
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
          fill("code", note("", `Code for another browser, valid ten minutes, once: <code>${e(r.code)}</code>`));
        }
        break;
      }
      case "unpair":
        if (!confirm("Unpair this browser? It will need a new link from the app.")) break;
        try {
          await b.unpair?.();
          await b.start();
        } catch (err) {
          await fail(err);
        }
        break;
      case "address":
        $("post")?.classList.toggle("addressed");
        break;
      case "reply": {
        if (!card) break;
        replying = { id: card.dataset.post, signer: card.dataset.signer };
        const w = card.querySelector(".who")?.outerHTML ?? "";
        fill("replying", `<span class="chip">Replying to ${w}<button type="button" data-action="unreply" title="Not a reply">\xD7</button></span>`);
        setTab("public");
        $("post")?.querySelector("textarea")?.focus();
        break;
      }
      case "unreply":
        replying = null;
        fill("replying", "");
        break;
      case "answer": {
        const f = $("message");
        (f?.elements.namedItem("to")).value = d.id ?? "";
        f?.querySelector("textarea")?.focus();
        break;
      }
      case "follow":
      case "unfollow":
      case "mute":
      case "unmute": {
        if (d.action === "mute" && !confirm("Mute this identity? Nothing of it is shown here any more. Nobody is told; it is never published.")) break;
        const r = await busy("Saving\u2026", () => b.ask(d.action, { id: d.id }));
        if (r) {
          const open = $("people")?.open;
          await refresh();
          if (open) $("people").open = true;
          if (r.lines.length) say("done", lines(r.lines));
        }
        break;
      }
      case "call": {
        const name = prompt("Your name for this identity. It stays in this app, never published.");
        if (name === null) break;
        if (await busy("Saving\u2026", () => b.ask("call", { id: d.id, name }))) {
          await refresh();
          $("people").open = true;
        }
        break;
      }
      case "withdraw": {
        if (!confirm("Withdraw this picture? Readers stop showing it; the post stays. It cannot be undone.")) break;
        const r = await busy("Withdrawing\u2026", () => b.ask("withdraw", { publication: d.publication }));
        if (r) {
          say("done", `The picture is withdrawn (act <code>${e(r.id.slice(0, 16))}\u2026</code>).`);
          await readFeed2();
        }
        break;
      }
      case "feed":
        say("", "");
        await Promise.all([readFeed2(), readInbox()]);
        await readSigning();
        break;
      case "accept": {
        if (!confirm("Sign it? Your signature is public, and binds you to exactly what you read here.")) break;
        const r = await busy("Signing, and answering the proposer\u2026", () => b.ask("accept", { thread: d.thread }));
        if (r) {
          await readSigning();
          say("done", `<strong>Signed.</strong>${lines(r.lines)}`);
        }
        break;
      }
      case "decline": {
        const why = prompt("Decline it. Your reason, if you like (sent to the proposer, sealed):");
        if (why === null) break;
        const r = await busy("Declining\u2026", () => b.ask("decline", { thread: d.thread, why }));
        if (r) {
          await readSigning();
          say("done", lines(r.lines));
        }
        break;
      }
      case "share": {
        const r = await busy("Opening your share with its one-time key, and checking it against the dealing\u2026", () => b.ask("share", { thread: d.thread }));
        if (r) {
          say("", "");
          const card2 = app3.querySelector(`.proposal[data-thread="${CSS.escape(r.thread)}"]`);
          if (card2) card2.outerHTML = share(r);
        }
        break;
      }
      case "share-written": {
        const card2 = $("share-shown");
        if (card2) card2.outerHTML = `<div class="proposal" data-thread="${e(d.thread)}">${shareTypeBack(d.thread, (d.positions ?? "").split(",").map(Number))}</div>`;
        break;
      }
      case "sharehand": {
        if (!confirm("Your share came by hand, shown on the founder\u2019s screen? The one-time key is destroyed: a share sealed to it could never be opened.")) break;
        const r = await busy("Destroying the one-time key\u2026", () => b.ask("sharehand", { thread: d.thread }));
        if (r) {
          await readSigning();
          say("done", lines(r.lines));
        }
        break;
      }
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
  app3.addEventListener("submit", async (ev) => {
    const form = ev.target;
    const name = form.getAttribute("id");
    if (name === "pair") return;
    ev.preventDefault();
    const d = new FormData(form);
    if (form.classList.contains("share-back")) {
      const typed = [...form.querySelectorAll("input")].map((i) => i.value);
      const r = await busy("Checking the words, then destroying the one-time key\u2026", () => b.ask("shareback", { thread: form.dataset.thread, typed }));
      if (r) {
        await readSigning();
        say("done", `<strong>Your share is written down.</strong>${lines(r.lines)}`);
      }
      return;
    }
    switch (name) {
      case "begin": {
        const r = await busy(
          "Asking each home who runs it, and making the identity\u2026",
          () => b.ask("begin", { homes: linesOf2(d.get("homes")), relays: linesOf2(d.get("relays")), via: viaOf(d.get("via")), name: String(d.get("name") ?? "") })
        );
        if (r) {
          shown = { positions: r.positions };
          app3.innerHTML = words(r.words, r.say, b.web);
        }
        return;
      }
      case "confirm": {
        const typed = [...form.querySelectorAll("input")].map((i) => i.value);
        const r = await busy("Checking the words, then sending the genesis to the homes\u2026", () => b.ask("confirm", { typed }));
        if (r) {
          shown = null;
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
          feed = [];
          inbox = null;
          await b.start();
          say("done", `<strong>The identity is here.</strong>${lines(r.lines)}`);
        }
        return;
      }
      case "renew": {
        const r = await busy("Checking the new words at its homes\u2026", () => b.ask("renew", { words: words2(d.get("words")) }));
        if (r) {
          await refresh();
          say("done", `<strong>The new words are in use.</strong>${lines(r.lines)}`);
        }
        return;
      }
      case "name": {
        const r = await busy("Publishing the name\u2026", () => b.ask("name", { name: String(d.get("name") ?? "") }));
        if (r) {
          const s = await b.ask("state");
          state = s;
          app3.innerHTML = identityWindow(s, b.web, b.suggested?.() ?? {});
          say("done", r.lines.length ? lines(r.lines) : "Nothing changed.");
        }
        return;
      }
      case "post": {
        const file = form.elements.namedItem("picture").files?.[0];
        const reply = replying;
        const r = await busy(
          file ? "Stripping the picture, publishing, and reading it back\u2026" : "Publishing, and reading it back\u2026",
          async () => b.ask("post", { text: String(d.get("text") ?? ""), jpeg: file ? await base642(file) : "", to: String(d.get("to") ?? ""), reply })
        );
        if (r) {
          form.reset();
          form.classList.remove("addressed");
          replying = null;
          fill("replying", "");
          fill("picked", "");
          feed = [r.post, ...feed.filter((x) => x.id !== r.post.id)];
          setFilter("all");
          say("done", `<strong>Posted.</strong>${lines(r.lines)}`);
          await readFeed2();
        }
        return;
      }
      case "message": {
        const r = await busy("Sealing it, and leaving it in their inbox\u2026", () => b.ask("message", { to: String(d.get("to") ?? ""), text: String(d.get("text") ?? "") }));
        if (r) {
          form.reset();
          say("done", `<strong>Sent.</strong>${lines(r.lines)}`);
          await readInbox();
        }
        return;
      }
      case "follow": {
        const r = await busy("Following\u2026", () => b.ask("follow", { id: words2(d.get("id")), name: words2(d.get("name")) }));
        if (r) {
          await refresh();
          $("people").open = true;
          say("done", `<strong>Followed.</strong>${r.lines.length ? lines(r.lines) : ""}`);
        }
        return;
      }
    }
  });
  return { show };
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
    const k = new _WebKeep(await request(r));
    await k.migrate();
    return k;
  }
  async get(key) {
    return request(this.db.transaction(STORE).objectStore(STORE).get(key));
  }
  async write(f) {
    const t = this.db.transaction(STORE, "readwrite");
    f(t.objectStore(STORE));
    await new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("the browser refused to keep it"));
    });
  }
  put(key, value) {
    return this.write((s) => s.put(JSON.parse(JSON.stringify(value)), key));
  }
  /** The single identity kept before 16 October 2026, moved under its ID and put in use. */
  async migrate() {
    const f = await this.get("identity");
    if (!f || f.label !== TEST_LABEL) return;
    const s = await this.get("settings");
    await this.write((st) => {
      st.put(f, `identity:${f.identity}`);
      if (s) st.put(s, `settings:${f.identity}`);
      st.put(f.identity, "active");
      st.delete("identity");
      st.delete("settings");
    });
  }
  async held() {
    const keys = await request(this.db.transaction(STORE).objectStore(STORE).getAllKeys());
    return keys.map(String).filter((k) => k.startsWith("identity:")).map((k) => k.slice(9)).sort();
  }
  async active() {
    const a = await this.get("active") ?? null;
    return a && (await this.held()).includes(a) ? a : null;
  }
  async setActive(id) {
    await this.put("active", id);
  }
  async identity(id) {
    const f = await this.get(`identity:${id}`);
    if (!f) return null;
    if (f.label !== TEST_LABEL) throw new Error("What this browser keeps is not a MOR test identity.");
    return new TestIdentity(f);
  }
  async saveIdentity(id) {
    if (id.f.safety.seeds) throw new Error("A chain key is never kept in this browser.");
    await this.put(`identity:${id.id}`, id.f);
  }
  async settings(id) {
    return await this.get(`settings:${id}`) ?? { kind: "made", relays: [], via: {} };
  }
  async saveSettings(id, s) {
    await this.put(`settings:${id}`, { kind: s.kind, relays: s.relays, via: {}, ...s.signing ? { signing: true } : {} });
  }
  async people(id) {
    return { ...NO_PEOPLE(), ...await this.get(`people:${id}`) ?? {} };
  }
  async savePeople(id, p) {
    await this.put(`people:${id}`, p);
  }
  /** The Signing tab's state, `signing:ID`: a one-time key's secret only while its share waits (H18). */
  async signing(id) {
    return { ...NO_SIGNING(), ...await this.get(`signing:${id}`) ?? {} };
  }
  async saveSigning(id, s) {
    await this.put(`signing:${id}`, s);
  }
  /** Forget an identity in this browser: its keys and everything kept about it. Only its signing key's words, if written down, bring it back. */
  async forget(id) {
    await this.write((s) => {
      for (const k of ["identity", "settings", "people", "signing"]) s.delete(`${k}:${id}`);
    });
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
  /**
   * One signer at a time across every tab of this site: two tabs signing at
   * once would put two acts at one position of a line. Each signer reads
   * the identity afresh inside the lock (`Dub` does).
   */
  exclusive(f) {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f);
  }
};

// src/web/app.ts
var app2 = document.getElementById("app");
var keep;
var dub;
var list4 = (x) => Array.isArray(x) ? x.map(String) : [];
var platform = { bytes: (b642) => Uint8Array.from(atob(b642), (ch) => ch.charCodeAt(0)), via: () => ({}) };
var ask = (op, a = {}) => run(dub, op, a, platform);
async function deployer() {
  try {
    const r = await fetch("dub.json", { cache: "no-store" });
    if (!r.ok) return {};
    const j = await r.json();
    const urls = (x) => list4(x).filter((s) => /^https:\/\/[^\s]+$/.test(s));
    return { homes: urls(j.homes), relays: urls(j.relays), reader: urls([j.reader])[0] };
  } catch {
    return {};
  }
}
var suggested = {};
var ui = mount(app2, { web: true, ask, start, suggested: () => suggested });
async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app2.innerHTML = `${top(true)}${note("error", "This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.")}`;
    return;
  }
  try {
    keep ??= await WebKeep.open();
  } catch (err) {
    app2.innerHTML = `${top(true)}${note("error", `This browser does not let the page keep anything (${e(err instanceof Error ? err.message : String(err))}). A private window may not.`)}`;
    return;
  }
  if (!dub) {
    const d = await deployer();
    suggested = { homes: d.homes, relays: d.relays };
    dub = new Dub(keep, { web: true, reader: d.reader });
  }
  let state;
  try {
    state = await dub.state();
  } catch (err) {
    app2.innerHTML = `${top(true)}${note("error", e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  await ui.show(state);
}
void start();
