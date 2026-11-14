/* @ts-self-types="./mor_wasm.d.ts" */

/**
 * The core library's verifier: holds the acts a client fetched, and judges
 * identity chains and acts from them alone (Identity, "Verification
 * procedures"). Nothing a relay says unsigned enters it.
 */
export class Verifier {
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
                ptr3 = 0; len3 = 0;
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
                ptr2 = 0; len2 = 0;
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
     * As `moneyChoose`, the pointer in force read by Agreements (Money
     * draft 10, rule 7, F358): for a collective, a pointer signed with the
     * member keys of its area reaching Money counts where that area's
     * holders and threshold are met. `specs` as for every Agreements call.
     * @param {any} specs
     * @param {string} payee
     * @param {any} amount
     * @param {string[]} accepted
     * @returns {any}
     */
    agreementsChoose(specs, payee, amount, accepted) {
        const ptr0 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(accepted, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsChoose(this.__wbg_ptr, specs, ptr0, len0, amount, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
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
     * What a fork of `collective` must hand out, its line the acts `line`
     * it would cite on the collective's chain, with `agreement` in force
     * there: every obligation in that history, its own and those an
     * earlier fork handed to it. Null where the line does not hold.
     * @param {any} specs
     * @param {string} collective
     * @param {string} agreement
     * @param {string[]} line
     * @returns {string[] | undefined}
     */
    agreementsHandOut(specs, collective, agreement, line) {
        const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(line, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsHandOut(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, ptr2, len2);
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
     * The acts the history of a line citing `line` on the collective's
     * chain names that this verifier does not hold: a member's client signs
     * no fork or closing while any is missing (client conformance).
     * @param {any} specs
     * @param {string} collective
     * @param {string[]} line
     * @returns {string[]}
     */
    agreementsLineUnheld(specs, collective, line) {
        const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(line, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsLineUnheld(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
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
        return ret[0] === 0xFFFFFF ? undefined : ret[0] !== 0;
    }
    /**
     * The payments a collective received during a broken stretch and owes
     * back, the sale not signed anew after the rollback (rule 37d, RB2):
     * open obligations, each `{ payment, to, unit, value, stillBroken,
     * unknown }`. An entry is marked `unknown` where it rests on a record
     * whose payment `specs.railPayments` does not state, or on one whose
     * rail answer `specs.railValid` does not give (Money rules 8 and 12).
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
     * attempts to reach homes, shown as unknown (F153); an error coded
     * `law/payment-unstated` where it rests on whether two receipts
     * or claims are one payment and `specs.railPayments` does not say
     * (Money rule 12, F380), shown as unknown.
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
     * The payee pointer in force as Agreements judge it (F358): `{ act,
     * version, why }`, `act` null and `why` said where none counts.
     * @param {any} specs
     * @param {string} payee
     * @returns {any}
     */
    agreementsPointer(specs, payee) {
        const ptr0 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsPointer(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * The tips a payment names (F409), for a publication by its first
     * version: `latest`, its latest versions (two or more, the parties'
     * fork); `tags`, the latest version of each price tag line that counts
     * under it, one per price; `owners` and `ownersLatest`, the ownership
     * agreement it names and that agreement's latest version, which a
     * purchase names in field 9.
     * @param {any} specs
     * @param {string} first
     * @returns {any}
     */
    agreementsPublicationTip(specs, first) {
        const ptr0 = passStringToWasm0(first, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsPublicationTip(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * A publication, judged (Agreements rule 11): its parties and who has
     * not signed, whether it counts and why not, the latest versions of its
     * line, whether this version ends it, and the ownership agreements
     * claiming what it sells that it stands outside of (rule 14).
     * @param {any} specs
     * @param {string} id
     * @returns {any}
     */
    agreementsPublication(specs, id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsPublication(this.__wbg_ptr, specs, ptr0, len0);
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
     * The contests shown beside a purchase (Agreements rule 54, "Contest
     * (type 14)", F386), by the act that is the purchase (the buyer's
     * payer's claim of the payment, or the buyer's signature act on an
     * offer at no price): the buyer's own contests of it, ascending. A
     * contest by anyone else shows nothing; for an act that is no
     * purchase, none shows. `specs.railValid` names the claims whose rail
     * the client checked. Errs where it is unknown: `law/payment-unstated`
     * where it rests on two or more records whose payment
     * `specs.railPayments` does not state (Money rule 12);
     * `law/rail-unanswered` where it rests on a claim neither
     * `specs.railValid` nor `specs.railInvalid` names (Money rule 8: a
     * record counts toward a purchase only with a valid answer).
     * @param {any} specs
     * @param {string} purchase
     * @returns {string[]}
     */
    agreementsPurchaseContests(specs, purchase) {
        const ptr0 = passStringToWasm0(purchase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsPurchaseContests(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
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
     * or "unknown" (Money rule 8: the receipt or claim `id`, or a receipt
     * it is judged with, is named neither in `specs.railValid` nor in
     * `specs.railInvalid`, and the answer rests on it); null where the
     * payment is not for a work.
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
    agreementsRecord(specs, collective, record) {
        const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(record, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
     * @param {string} owners
     * @param {string[]} holders
     * @param {string | null} [previous]
     * @returns {Float64Array | undefined}
     */
    agreementsSplitTurns(specs, service, owners, holders, previous) {
        const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(owners, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(holders, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsSplitTurns(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
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
     * Whether a price tag counts under its publication (Money rule 18;
     * Agreements rule 12): "counts" (with the publication, and whether this
     * version withdraws the tag), "nobody's offer" or "unknown", with why.
     * @param {any} specs
     * @param {string} tag
     * @returns {any}
     */
    agreementsTagUnder(specs, tag) {
        const ptr0 = passStringToWasm0(tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsTagUnder(this.__wbg_ptr, specs, ptr0, len0);
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
                ptr2 = 0; len2 = 0;
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
     * A vow, read (Agreements rule 13; F237, F240, F253): its signer, whether
     * its genesis is void, its versions and latest words, the offers naming
     * it, and each sale with its state, "pending", "confirmed" (with the
     * acknowledging acts) or "contested" (with the contests), and the
     * evidence beside it; and the payments with no buyer signed on.
     * `specs.railValid` names the receipts and claims whose rail the
     * client checked: a payment is a sale only by a record with the rail's
     * answer, valid, and read only from a buyer's own claim with it. A
     * sale or payment resting on a record neither `specs.railValid` nor
     * `specs.railInvalid` names is marked "unknown" (a sale's state, or
     * the `unknown` list; Money rule 8).
     * @param {any} specs
     * @param {string} name
     * @returns {any}
     */
    agreementsVow(specs, name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsVow(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Who made a work and who owns it as recorded (Agreements rule 15;
     * F218; F412; F416), the core's `work_owners`: `{ work, claims,
     * contested, agreements, defaultHolder, holders }`. `claims`, the
     * claims that count and bind the work, ascending; `contested`, two or
     * more; `agreements`, the ownership agreements targeting a claim of the
     * work, each its version in force; `defaultHolder`, where no agreement
     * writes shares and one claim binds it, that claim's opener (a
     * collective, for a claim a member signed for it), else null;
     * `holders`, for each agreement in force `{ agreement, holders:
     * [[holder, share]] }`, its stake's holders as that version writes them
     * (field 7, shares in millionths), a collective one holder among them.
     * *Not applied here:* stake transfers since that version (rule 14):
     * the core's as-held reading is not public (round 10, for the MOR
     * lead). Added in the Dubsar Suite's round 10 (F415), by the MOR lead's
     * leave; no change to the core.
     * @param {any} specs
     * @param {string} work
     * @returns {any}
     */
    agreementsWorkOwners(specs, work) {
        const ptr0 = passStringToWasm0(work, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_agreementsWorkOwners(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Who uploaded a bake, as a verifier reading Money and Envelopes tells
     * it (Money, "Only identities have payee pointers"): the signer's
     * identity hash, or "unknown" where the bake names another chain, a
     * collective's perhaps, which a Money-only wallet refuses to tip.
     * `null` for no bake held.
     * @param {string} bake
     * @returns {string | undefined}
     */
    bakeUploader(bake) {
        const ptr0 = passStringToWasm0(bake, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_bakeUploader(this.__wbg_ptr, ptr0, len0);
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
                ptr2 = 0; len2 = 0;
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
                ptr3 = 0; len3 = 0;
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
     * Where a payer pays this payee this amount (the payment cMIP,
     * "Choosing where to pay"; Money rules 1, 3 and 5): the pointer that
     * counts and the vault in force, as this verifier holds the payee's
     * acts, and the first rail, in the payee's order, on a rail Module the
     * person accepts that carries the unit. `{ to: "flow", pointer, rail,
     * module, address }`, `{ to: "vault", declaredBy, entry, module,
     * address }` or `{ to: "nowhere", why }`.
     * @param {string} money_spec
     * @param {string} payee
     * @param {any} amount
     * @param {string[]} accepted
     * @returns {any}
     */
    moneyChoose(money_spec, payee, amount, accepted) {
        const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(accepted, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyChoose(this.__wbg_ptr, ptr0, len0, ptr1, len1, amount, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * The forward a receipt declares that no valid record of the next hop
     * carries on (Money rule 27): that hop's open obligation, under the
     * agreement the forward names, `{ debtor, creditor, amount, agreement }`;
     * null where it declares none, or it is carried on. Throws, coded as
     * a rail's answer not given, where that cannot be told yet.
     * @param {any} specs
     * @param {string} receipt
     * @returns {any}
     */
    moneyForwardOwed(specs, receipt) {
        const ptr0 = passStringToWasm0(receipt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyForwardOwed(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Judge a receipt or claim this verifier holds, as a Money-only client
     * with the person's accepted cMIPs and Modules (F338): the act's
     * standing; the rail's answer, by the rail Module its field 0 names,
     * adopted only if accepted (a Module, unit or payment cMIP not accepted
     * is unknown: Development rule 9); and what is judged beside it.
     * @param {string} act
     * @param {any} opts
     * @returns {any}
     */
    moneyJudge(act, opts) {
        const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyJudge(this.__wbg_ptr, ptr0, len0, opts);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * The payee pointer that counts for an identity (Money rule 1), from
     * the valid pointers this verifier holds: `{ act, version, forked }`,
     * `act` null where it holds none; `forked` where two name one
     * predecessor, the pointer that counts the last before the fork.
     * @param {string} money_spec
     * @param {string} payee
     * @returns {any}
     */
    moneyPointer(money_spec, payee) {
        const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyPointer(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * A refund owed on a purchase paid through a route, back hop by hop
     * (Money rule 28), last hop first: `[{ record, debtor, creditor,
     * amount, agreement, repaid }]`, `repaid` null where it cannot be
     * told; empty where the route is not valid or no refund is owed.
     * @param {any} specs
     * @param {string} last
     * @returns {any}
     */
    moneyRefundAlong(specs, last) {
        const ptr0 = passStringToWasm0(last, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyRefundAlong(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Who buys the purchase a route's last record is (Money rule 24;
     * Agreements, "A contest of a purchase"): `{ buyer, payer, claim,
     * service, astray, route }`, `buyer` one of "no route" (the record
     * names no previous hop: the ordinary rule), "the first payer" (with
     * `payer` and `claim`, their claim of the first hop naming the tag:
     * the claim a contest names), "the service, for its own account"
     * (with `service`, and `astray`: the first payer's claims naming
     * another tag), "none" (the route stopped or broken: no purchase at
     * the seller, with `route`), or "unknown" (not yet: a contest shows
     * nothing yet).
     * @param {any} specs
     * @param {string} last
     * @returns {any}
     */
    moneyRouteBuyer(specs, last) {
        const ptr0 = passStringToWasm0(last, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyRouteBuyer(this.__wbg_ptr, specs, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * A route across rails (Money rules 24 to 28), the rail answers in
     * `specs` (`railValid`, `railInvalid`, `railPayments`,
     * `rails`): `direction` "to" reads the route ending at the receipt or
     * claim `act`, as its final creditor does, back through the previous
     * hop each record names (receipt field 6, claim key 10); "from"
     * follows it forward from the receipt `act`. `{ route, hops, at, why,
     * agreement, owed, near }`: `route` "valid" (`hops` first to last),
     * "stopped" (rule 27: at the receipt `at`, whose forward no valid
     * record of the next hop carries on, `owed` its open obligation:
     * `{ debtor, creditor, amount: { unit, value }, agreement }`; `near`
     * the records naming it that do not carry it on, each `[act, why]`),
     * "broken" (rule 28: at the record `at`, under `agreement`, `why`) or
     * "unknown" (a rail's answer on it pending or not held).
     * @param {any} specs
     * @param {string} act
     * @param {string} direction
     * @returns {any}
     */
    moneyRoute(specs, act, direction) {
        const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(direction, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyRoute(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * The vault an identity's chain declares in force (Money rule 3), as
     * this verifier holds the chain: `{ declaredBy, entries }`, or null
     * where it declares none.
     * @param {string} money_spec
     * @param {string} identity
     * @returns {any}
     */
    moneyVault(money_spec, identity) {
        const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_moneyVault(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
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
     * Whose offer a price tag is (Money rule 18), as a verifier reading
     * Money and Envelopes tells it: "counts" (on a bare bake, its
     * uploader's), "nobody's offer", or "unknown" (not held, or under a
     * publication, which Agreements judges). `null` for no price tag held.
     * @param {string} act
     * @returns {string | undefined}
     */
    priceTag(act) {
        const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.verifier_priceTag(this.__wbg_ptr, ptr0, len0);
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
                ptr2 = 0; len2 = 0;
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
}
if (Symbol.dispose) Verifier.prototype[Symbol.dispose] = Verifier.prototype.free;

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function actId(bytes) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.actId(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
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
 * What a clone changes from its parent, each change's tier, and the powers
 * its mark must name (rules 44a to 44c), from the two terms payloads. For
 * a client preparing a clone's mark, and showing what it changes.
 * @param {Uint8Array} parent
 * @param {Uint8Array} clone
 * @param {any} specs
 * @returns {any}
 */
export function agreementsClonePlan(parent, clone, specs) {
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

/**
 * A control model's answer, given as CBOR in Agreements rule 99's format,
 * as the rule reads it: "overreaching", "refused", "unknown", "an act, no
 * area", "an act, area N" or "a clone". Throws only on bytes that are no
 * CBOR item.
 * @param {Uint8Array} answer
 * @returns {string}
 */
export function agreementsControlAnswer(answer) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(answer, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.agreementsControlAnswer(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
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
 * The default control cMIP's hash (its stand-in, test data): the `spec` of
 * its own acts, the issuance offer (type 26), the proxy (type 27) and the
 * revocation of a proxy (type 28), which are no Agreements types since
 * Agreements draft 19 (rule 99), and the cMIP field 35 names.
 * @returns {string}
 */
export function agreementsControlCmip() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.agreementsControlCmip();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Move a terms payload's legacy fields 20, 30, 32 and 34 (the areas, their
 * words, the holders' rules, an issuance's offer) into field 35, naming the
 * default control cMIP with them as its parameters (Agreements rule 99), and
 * return the payload as CBOR. A collective's terms carrying none of them get
 * field 35 with empty parameters; terms that are no collective's are
 * returned as they came. A migration aid for clients that built field 34.
 * @param {Uint8Array} payload
 * @returns {Uint8Array}
 */
export function agreementsControlPack(payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.agreementsControlPack(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Agreements rule 15a (F150, F165): `{ total, holders: [[hex, share]], turns }`
 * divided among the holders by their shares, each holder its exact share
 * rounded down, leftover units one each to the largest fractional
 * remainders; holders with equal remainders take turns: the fewest
 * leftover units so far (`turns`) first, then the smallest identity hash.
 * The parts, in the holders' order; an error where a tie decides a unit
 * and no turns are given.
 * @param {any} input
 * @returns {Float64Array}
 */
export function agreementsDivideStake(input) {
    const ret = wasm.agreementsDivideStake(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * The checker, for one act's bytes (and its content key if private):
 * `{ verdict, act, id, signer, rule, says, invalid, notes }`, the verdict
 * one of "pass", "rejected", "invalid", "unknown", "cannot open", "not this
 * encoding" (encoding-1, "What the checker answers").
 * @param {Uint8Array} act
 * @param {Uint8Array | null} [key]
 * @returns {any}
 */
export function agreementsNewCheck(act, key) {
    const ptr0 = passArray8ToWasm0(act, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(key) ? 0 : passArray8ToWasm0(key, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.agreementsNewCheck(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The checker, for the acts a verifier holds together (`[{ act, key? }]`):
 * each answer, with G6.1 read among them.
 * @param {any} acts
 * @returns {any}
 */
export function agreementsNewCheckHeld(acts) {
    const ret = wasm.agreementsNewCheckHeld(acts);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A report's payload, as CBOR (encoding-1, "The report": a proposal).
 * @param {any} input
 * @returns {Uint8Array}
 */
export function agreementsNewReportPayload(input) {
    const ret = wasm.agreementsNewReportPayload(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * The spec hash and type number of each new act (encoding-1, E2): Terms
 * and Statement under draft 24's spec hash; the report, a proposal, under
 * the report block's third proposal's.
 * @returns {any}
 */
export function agreementsNewSpecs() {
    const ret = wasm.agreementsNewSpecs();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A Statement's payload, as CBOR (encoding-1, "Statement").
 * @param {any} input
 * @returns {Uint8Array}
 */
export function agreementsNewStatementPayload(input) {
    const ret = wasm.agreementsNewStatementPayload(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A Terms act's payload, as CBOR, for `makeEveryday` (encoding-1, "Terms").
 * @param {any} input
 * @returns {Uint8Array}
 */
export function agreementsNewTermsPayload(input) {
    const ret = wasm.agreementsNewTermsPayload(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A collective's control model's query answer (Agreements rule 99,
 * `query-answer`), as CBOR, for terms given as CBOR, read through the
 * models the binding holds (the default control cMIP): its areas (key 0),
 * each stake's holders' rule (key 1), and each act type it gives a power by
 * share with that power (key 2; empty under the default cMIP), so that a
 * client can show founders who acts on what, Money first. Throws where the
 * terms name no control model, or one the binding does not hold.
 * @param {Uint8Array} payload
 * @returns {Uint8Array}
 */
export function agreementsQueryAnswer(payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.agreementsQueryAnswer(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * The powers a rollback's mark names (Agreements rule 37d, F185), from the terms
 * of the agreement in force just before the broken act and the rollback's
 * clone: the constitutional change rule, and the judicial tier's rule
 * where the clone changes a judge, whatever its other changes.
 * @param {Uint8Array} parent
 * @param {Uint8Array} clone
 * @returns {any}
 */
export function agreementsRollbackPlan(parent, clone) {
    const ptr0 = passArray8ToWasm0(parent, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(clone, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.agreementsRollbackPlan(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Agreements rule 15a (F165, F171): the running count a split act carries for a
 * stake (field 4, PROPOSED format, to confirm with Nobody, allegedly):
 * `{ pot, holders, paid, before }` gives `before` plus each holder's
 * leftover units in `paid` (what it was paid above its exact share of
 * `pot` rounded down), every holder named, as `[hex, count]` sorted by
 * identity hash.
 * @param {any} input
 * @returns {any}
 */
export function agreementsSplitTally(input) {
    const ret = wasm.agreementsSplitTally(input);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A batch of leaves: its root, and each leaf's branch.
 * @param {string[]} leaves
 * @returns {any}
 */
export function anchoringBatch(leaves) {
    const ptr0 = passArrayJsValueToWasm0(leaves, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringBatch(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The payer's check of a ticket before paying (the anchoring cMIP draft 6,
 * client conformance: "Check the ticket before paying"), against the
 * publication act and the price tag act paid (the latest versions the
 * client found): it names the publication, the leaf sent and the payer's
 * commitment; the commitment pays the ticket's tier's own tag, exactly the
 * tier's price, to its payee; the deadline is after
 * `now` (the payer's own point on the clock) and within the tier's blocks
 * and one block of slack. Null where acceptable, else why not.
 * @param {Uint8Array} publication
 * @param {Uint8Array} tag
 * @param {Uint8Array} ticket
 * @param {Uint8Array} commitment
 * @param {string} leaf
 * @param {bigint} now
 * @returns {string | undefined}
 */
export function anchoringCheckTicket(publication, tag, ticket, commitment, leaf, now) {
    const ptr0 = passArray8ToWasm0(publication, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(tag, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(ticket, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(commitment, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(leaf, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringCheckTicket(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, now);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    let v6;
    if (ret[0] !== 0) {
        v6 = getStringFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v6;
}

/**
 * A leaf of the anchoring cMIP's batch: `H_leaf(act || blind)`.
 * @param {string} act
 * @param {Uint8Array} blind
 * @returns {string}
 */
export function anchoringLeaf(act, blind) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(blind, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.anchoringLeaf(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
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
 * A pooled anchoring service's publication (Agreements type 6; the
 * anchoring cMIP draft 6, item 9): a lone seller's, the service its own
 * split service under a split plan naming `splitCmip`, selling exactly
 * this cMIP's terms, its tiers at fixed prices in the unit of `network`, on
 * that network's Bitcoin clock, its refund point `refundUntil` where one is
 * set. `{ type, payload }`, to sign under the Agreements MIR's spec, by the
 * service, public, with no `objects`: its first version.
 * @param {number} network
 * @param {any} tiers
 * @param {string | null | undefined} words
 * @param {string} service
 * @param {string} split_cmip
 * @param {bigint | null} [refund_until]
 * @returns {any}
 */
export function anchoringOffer(network, tiers, words, service, split_cmip, refund_until) {
    var ptr0 = isLikeNone(words) ? 0 : passStringToWasm0(words, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(split_cmip, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringOffer(network, tiers, ptr0, len0, ptr1, len1, ptr2, len2, !isLikeNone(refund_until), isLikeNone(refund_until) ? BigInt(0) : refund_until);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The price tags of an anchoring publication: **one per tier, each paying
 * exactly that tier's price** (Money rule 18), first versions naming the
 * publication's first version `publication`, paid to the service. `[{
 * tier, type, payload }]`, each to sign under the Money MIR's spec by the
 * service, public.
 * @param {number} network
 * @param {any} tiers
 * @param {string} publication
 * @param {string} service
 * @returns {any}
 */
export function anchoringPriceTags(network, tiers, publication, service) {
    const ptr0 = passStringToWasm0(publication, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringPriceTags(network, tiers, ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A publication's payload (the anchoring cMIP, item 9, type 3), with the
 * key its output is tweaked from (draft 6, fields 5 and 6).
 * @param {any} input
 * @returns {Uint8Array}
 */
export function anchoringPublication(input) {
    const ret = wasm.anchoringPublication(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * An anchoring publication act read as this cMIP's offer (draft 6, item
 * 9; `service::Offer::from_publication`), with the price tag acts given
 * beside it (`tags`, an array of acts; may be empty): its first version,
 * payee (the service), unit, the Bitcoin clock's network, tiers, words,
 * refund point, and the tag that pays each tier exactly (`tags: [{ tier,
 * tag }]`, a tier with none absent). The caller finds the latest version
 * of each (Agreements rule 11, Money rule 18). Throws where it is no
 * anchoring publication, saying why.
 * @param {Uint8Array} publication
 * @param {any | null} [tags]
 * @returns {any}
 */
export function anchoringReadOffer(publication, tags) {
    const ptr0 = passArray8ToWasm0(publication, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringReadOffer(ptr0, len0, isLikeNone(tags) ? 0 : addToExternrefTable0(tags));
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A publication's payload read, or `null`.
 * @param {Uint8Array} payload
 * @returns {any}
 */
export function anchoringReadPublication(payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringReadPublication(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A ticket's payload read, or `null`.
 * @param {Uint8Array} payload
 * @returns {any}
 */
export function anchoringReadTicket(payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringReadTicket(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A ticket's payload (the anchoring cMIP, item 9, type 2).
 * @param {any} input
 * @returns {Uint8Array}
 */
export function anchoringTicket(input) {
    const ret = wasm.anchoringTicket(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A batch anchor (the Bitcoin clock Module, "A batch anchor"), encoded.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function batchAnchor(input) {
    const ret = wasm.batchAnchor(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * Check a batch anchor of an act on the Bitcoin clock, against the chain
 * the client follows (the Bitcoin clock Module's rule): `{ answer, why,
 * point }`, the point the block's height where valid.
 * @param {string} act
 * @param {Uint8Array} proof
 * @param {any} chain
 * @returns {any}
 */
export function batchAnchorCheck(act, proof, chain) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(proof, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.batchAnchorCheck(ptr0, len0, ptr1, len1, chain);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Decode deterministic CBOR into JavaScript values: maps become `Map`s
 * (keys kept as numbers), byte strings `Uint8Array`s, integers numbers (or
 * `BigInt` beyond 2^53), text strings, arrays, booleans and null. Used for
 * the relay transport's messages.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function cborDecode(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.cborDecode(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Encode JavaScript values as deterministic CBOR: the inverse of
 * [`cbor_decode`], for non-negative integers, `Uint8Array`, strings,
 * arrays, `Map`s, booleans and null.
 * @param {any} v
 * @returns {Uint8Array}
 */
export function cborEncode(v) {
    const ret = wasm.cborEncode(v);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * @param {number} scheme
 * @param {Uint8Array} seeds
 * @returns {any}
 */
export function chainKeyFromSeeds(scheme, seeds) {
    const ptr0 = passArray8ToWasm0(seeds, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.chainKeyFromSeeds(scheme, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Check a terms payload (Agreements type 0), given as CBOR: its format and every
 * check that needs no other act (key grammar, areas, judges, F105 for
 * founding terms). Throws `agreements/<code>: <why>`.
 * @param {Uint8Array} payload
 * @param {any} specs
 */
export function checkTerms(payload, specs) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.checkTerms(ptr0, len0, specs);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Check that a string is canonical text (Text MIR), with the pinned Unicode
 * tables; throws naming the rule broken.
 * @param {string} s
 */
export function checkText(s) {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.checkText(ptr0, len0);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * The commitment itself, encoded in deterministic CBOR (the array the
 * money messages cMIP's invoice request carries).
 * @param {any} input
 * @returns {Uint8Array}
 */
export function commitmentCbor(input) {
    const ret = wasm.commitmentCbor(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A contest payload (Agreements type 14; BQ4, F188): the declaration of absence
 * it answers. Signed by the party the declaration names; the act carries,
 * in `objects`, `[declaration, declaration]`. It voids nothing (rule 52).
 * @param {string} declaration
 * @returns {Uint8Array}
 */
export function contestPayload(declaration) {
    const ptr0 = passStringToWasm0(declaration, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.contestPayload(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Deal a fresh chain key of a collective as shares, any `threshold` of
 * which rebuild it, with Pedersen commitments (air-gapped Module, section
 * 5; Agreements rule 36; F97). The key itself is never returned: only the
 * shares, its commitment and the dealing's fingerprint. **Test
 * collectives only**: here the dealing device is this program, in
 * software; a real collective deals on an offline device.
 * @param {any} input
 * @returns {any}
 */
export function dealChainKey(input) {
    const ret = wasm.dealChainKey(input);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * An abandonment declaration payload (Agreements type 13, B12): the agreement,
 * the version whose clause it applies (the last the party signed), the
 * party, and the outcomes, ascending. The act carries, in `objects`,
 * `[agreement, agreement]`.
 * @param {string} agreement
 * @param {string} clause
 * @param {string} party
 * @param {Uint32Array} outcomes
 * @returns {Uint8Array}
 */
export function declarationPayload(agreement, clause, party, outcomes) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(clause, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(party, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray32ToWasm0(outcomes, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.declarationPayload(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * A specification's content decoded whole (Development draft 10, Part
 * three; F322, F323, F325, F301): its fields as an object, or an error
 * beginning "no specification:" where the content is not in the format.
 * `paymentCmip`, where given, is the payment cMIP's spec hash, whose rail
 * Modules must carry fields 11 and 13.
 * @param {Uint8Array} content
 * @param {string | null} [payment_cmip]
 * @returns {any}
 */
export function decodeSpec(content, payment_cmip) {
    const ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(payment_cmip) ? 0 : passStringToWasm0(payment_cmip, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.decodeSpec(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Decode an act (strictly) and describe it. A public act is opened and
 * checked against its outside; its payload is returned as CBOR.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function describeAct(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.describeAct(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * An encryption-key payload (Envelopes type 4), for an X-Wing public key, as CBOR.
 * @param {number} version
 * @param {string | null | undefined} previous
 * @param {Uint8Array} _public
 * @returns {Uint8Array}
 */
export function encryptionKeyPayload(version, previous, _public) {
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

/**
 * A fork settlement payload (Agreements type 23; DQ8, F188): the settlement of
 * the judge of forks the reference names (terms field 27, QF2), or of the
 * link of its chain of judgment that took over (QG4), naming the request
 * that activated it, the version of the fork it keeps and every tip it
 * drops (QF3, F190), sorted here. A tip given twice is refused, as the
 * core refuses it. The act carries, in `objects`, `[request, request]`.
 * @param {string} request
 * @param {string} kept
 * @param {string[]} discarded
 * @returns {Uint8Array}
 */
export function forkSettlementPayload(request, kept, discarded) {
    const ptr0 = passStringToWasm0(request, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(kept, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(discarded, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.forkSettlementPayload(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * An object's short form: bech32m, lowercase, under its label (`mid`,
 * `mact`, `mkey`, `mspec`, `mwork`). A key's data is Identity's
 * `[scheme, key]` in deterministic CBOR; every other is a 32-byte hash.
 * @param {string} label
 * @param {Uint8Array} data
 * @returns {string}
 */
export function formEncode(label, data) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.formEncode(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
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
 * Read a string where `want` is asked: its short form, its where-it-lives
 * form, or bare hex for a 32-byte hash. Refused, in words, otherwise: a
 * broken checksum, mixed case, a label the core does not define, or
 * another kind than the one asked ("this is an act (mact), not an identity
 * (mid)").
 * @param {string} s
 * @param {string} want
 * @returns {any}
 */
export function formRead(s, want) {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(want, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.formRead(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The where-it-lives form: the short form, then each hint after `?r=`.
 * @param {string} label
 * @param {Uint8Array} data
 * @param {string[]} hints
 * @returns {string}
 */
export function formWithHints(label, data, hints) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(hints, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.formWithHints(ptr0, len0, ptr1, len1, ptr2, len2);
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
    }
}

/**
 * A key-delivery payload (Envelopes type 1), as CBOR.
 * @param {string} target
 * @param {Uint8Array} key
 * @param {boolean} media
 * @returns {Uint8Array}
 */
export function keyDeliveryPayload(target, key, media) {
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

/**
 * A Lightning rail address (or vault source), encoded: `[ network, node, ? endpoint ]`.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function lightningAddress(input) {
    const ret = wasm.lightningAddress(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A BOLT 11 invoice read by the Module's own decoder (its signature
 * checked, its node key recovered): `{ network, node, amountMsat,
 * paymentHash, descriptionHash, hasDescription }`. Throws where it is no
 * valid invoice.
 * @param {string} invoice
 * @returns {any}
 */
export function lightningInvoice(invoice) {
    const ptr0 = passStringToWasm0(invoice, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.lightningInvoice(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A Lightning rail proof: `[ invoice, ? preimage ]`.
 * @param {string} invoice
 * @param {Uint8Array | null} [preimage]
 * @returns {Uint8Array}
 */
export function lightningProof(invoice, preimage) {
    const ptr0 = passStringToWasm0(invoice, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(preimage) ? 0 : passArray8ToWasm0(preimage, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.lightningProof(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Lock a media object with a fresh content key and nonce (Envelopes,
 * "Media": XChaCha20-Poly1305, no associated data).
 * @param {Uint8Array} plaintext
 * @returns {any}
 */
export function lockMedia(plaintext) {
    const ptr0 = passArray8ToWasm0(plaintext, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.lockMedia(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A chain signature (Identity type 16, F132): an act on the identity
 * chain, signed by the revealed chain key, naming the act it signs and
 * committing the next chain key; nothing else changes. Agreements' members sign
 * forks and closings with it.
 *
 * The chain key here is held in software: **test identities only**. As
 * for a rotation, the caller keeps the returned bytes and sends exactly
 * them to every home (Identity rule 8a).
 * @param {any} input
 * @returns {Uint8Array}
 */
export function makeChainSignature(input) {
    const ret = wasm.makeChainSignature(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * An everyday act, next in the signer's sequence: position and running
 * summary computed from the sequence given (Envelopes rule 4).
 * @param {any} input
 * @returns {any}
 */
export function makeEveryday(input) {
    const ret = wasm.makeEveryday(input);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A genesis (Identity type 0), signed by its first signing key, or, for a
 * collective, which declares none, by its first chain key (Identity rule
 * 1), and checked with the core's genesis checks before it is returned.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function makeGenesis(input) {
    const ret = wasm.makeGenesis(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A rotation (Identity type 1), signed by the revealed chain key.
 *
 * The chain key here is held in software: **test identities only**. The
 * signature is hedged (fresh randomness), as the air-gapped Module signs;
 * the caller keeps the returned bytes and sends exactly them to every home
 * (Identity rule 8a).
 * @param {any} input
 * @returns {Uint8Array}
 */
export function makeRotation(input) {
    const ret = wasm.makeRotation(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A transaction's Merkle branch in its block, from the block's txids in
 * Bitcoin's own byte order: the siblings from the leaf up.
 * @param {Uint8Array[]} txids
 * @param {number} index
 * @returns {Uint8Array[]}
 */
export function merkleBranch(txids, index) {
    const ptr0 = passArrayJsValueToWasm0(txids, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.merkleBranch(ptr0, len0, index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * The spec hash of a MIR from its file, as Development rule 26 reads a
 * file: at most one final line break removed and nothing else (every line,
 * a draft's status line included, is part of the text), the text
 * canonical. Throws otherwise.
 * @param {string} file
 * @returns {string}
 */
export function mirFileHash(file) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(file, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.mirFileHash(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
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
 * The spec hash of a MIR's text, as the root recomputes it (Development
 * draft 10, rule 26, F324): `tagged_hash("MOR/spec", {0: 4, 9: text})`, the
 * text canonical. Throws where the text is not canonical.
 * @param {string} text
 * @returns {string}
 */
export function mirHash(text) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.mirHash(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
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
 * Money rule 3 (was 14a) on a vault in force: where a single payment of
 * this amount may go. `{ to: "flow" | "vault" | "nowhere", why }`.
 * @param {any} vault
 * @param {any} amount
 * @returns {any}
 */
export function moneyDestination(vault, amount) {
    const ret = wasm.moneyDestination(vault, amount);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A Money act's payload, encoded by the core and decoded back strictly
 * (Money, "Act formats"): `{ type, payload }`, to sign under the Money
 * MIR's spec hash. Throws where the core refuses it.
 * @param {any} input
 * @returns {any}
 */
export function moneyPayload(input) {
    const ret = wasm.moneyPayload(input);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A Money act's payload read strictly by its type: `{ act, more }`, `more`
 * naming fields present that `act` does not show. Throws where it is no
 * Money act of that type.
 * @param {number} type_
 * @param {Uint8Array} payload
 * @returns {any}
 */
export function moneyRead(type_, payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.moneyRead(type_, ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The spec hashes of the Money layer's cMIPs and Modules as the reference
 * implementations name them (test values until step 17), with the two rail
 * Modules' published content (Development draft 10, Part three), from
 * which their kind and binding are read (F301).
 * @returns {any}
 */
export function moneySpecs() {
    const ret = wasm.moneySpecs();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A fresh X-Wing private key (32 bytes).
 * @returns {Uint8Array}
 */
export function newEncryptionSecret() {
    const ret = wasm.newEncryptionSecret();
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A fresh everyday signing secret (Schnorr, scheme 1).
 * @returns {Uint8Array}
 */
export function newSigningSecret() {
    const ret = wasm.newSigningSecret();
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A fresh chain key held in software: its FIPS 205 seeds (48 bytes), its
 * public key and its commitment. **For test identities only** (build
 * brief: the real identity's chain key is made by the air-gapped Module).
 * @param {number} scheme
 * @returns {any}
 */
export function newTestChainKey(scheme) {
    const ret = wasm.newTestChainKey(scheme);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A string in NFC under the pinned Unicode tables (Text, rule 6), as the
 * core checks it: a client composes with the same tables it is checked
 * with, never its system's (Fable's T5).
 * @param {string} s
 * @returns {string}
 */
export function nfc(s) {
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

/**
 * A notice payload (Agreements type 24; F197): before closing, the collective's
 * notice to a payer owed money back who gave no address, naming the
 * payment (one receipt or claim of it) and a deadline on a time reference
 * (its hash, and the point on it, as an unsigned integer). The act is
 * sealed to the payer's identity, and carries, in `objects`, `[payment,
 * payment]`.
 * @param {string} payment
 * @param {string} time_reference
 * @param {bigint} deadline
 * @returns {Uint8Array}
 */
export function noticePayload(payment, time_reference, deadline) {
    const ptr0 = passStringToWasm0(payment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(time_reference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.noticePayload(ptr0, len0, ptr1, len1, deadline);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * An on-chain rail address (or vault source), encoded: `[ network, key, request, ? endpoint ]`.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function onchainAddress(input) {
    const ret = wasm.onchainAddress(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * The x-only public key of a secp256k1 secret (BIP 340): what an
 * on-chain rail address names as its request key.
 * @param {Uint8Array} secret
 * @returns {string}
 */
export function onchainKey(secret) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.onchainKey(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
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
 * Where a payment committing to `commitment` goes on this address (the
 * Module's pay-to-contract): `{ outputKey, script, address }`, `address`
 * the Taproot address as wallets write it (BIP 350's bech32m).
 * @param {Uint8Array} address
 * @param {string} commitment
 * @returns {any}
 */
export function onchainPayTo(address, commitment) {
    const ptr0 = passArray8ToWasm0(address, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.onchainPayTo(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * An on-chain rail proof: `[ request, ? [ tx, output, ? [ index, branch, headers ] ] ]`.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function onchainProof(input) {
    const ret = wasm.onchainProof(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * The payee's side's request for a commitment (the on-chain rail Module,
 * "The request"): a BIP 340 signature by the request key over the request
 * message, at the Module's six confirmations or the more `confirmations`
 * names. Returns the 64-byte signature.
 * @param {Uint8Array} secret
 * @param {string} commitment
 * @param {number | null} [confirmations]
 * @returns {Uint8Array}
 */
export function onchainRequest(secret, commitment, confirmations) {
    const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.onchainRequest(ptr0, len0, ptr1, len1, isLikeNone(confirmations) ? Number.MAX_SAFE_INTEGER : (confirmations) >>> 0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Open a locked media object. Throws if the key and nonce do not open it.
 * The caller checks the plaintext against the work hash (Envelopes rule 14).
 * @param {Uint8Array} locked
 * @param {Uint8Array} key
 * @param {Uint8Array} nonce
 * @returns {Uint8Array}
 */
export function openMedia(locked, key, nonce) {
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

/**
 * Open a sealed container with an X-Wing private key, as the identity `me`
 * (hex), or as a bare key when `me` is absent.
 * @param {Uint8Array} bytes
 * @param {string | null | undefined} me
 * @param {Uint8Array} secret
 * @returns {any}
 */
export function openSealed(bytes, me, secret) {
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

/**
 * Open a private act with a delivered key, and describe it.
 * @param {Uint8Array} act
 * @param {Uint8Array} key
 * @returns {any}
 */
export function openWithKey(act, key) {
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

/**
 * The payment commitment's hash (payment cMIP, "The payment commitment"):
 * what the payee's side commits to on the rail, and what a verifier
 * recomputes from a receipt or claim. The salt is 16 bytes the payer's
 * client draws at random for this payment (client conformance).
 * @param {any} input
 * @returns {string}
 */
export function paymentCommitment(input) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.paymentCommitment(input);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * The proof a receipt or claim carries in its field 1: `[ paid-to, salt, rail-proof ]`.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function paymentProof(input) {
    const ret = wasm.paymentProof(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * The pickup tag of an X-Wing public key used as a bare key.
 * @param {Uint8Array} _public
 * @returns {string}
 */
export function pickupTag(_public) {
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

/**
 * A publication's payload (Agreements type 6), encoded by the core and
 * decoded back strictly, its format's own checks applied: `{ type,
 * payload }`, to sign under the Agreements MIR's spec. Its `objects` are
 * the caller's to write: a later version names `[first, previous]` first;
 * one naming an ownership agreement names it as `[agreement, agreement]`.
 * @param {any} input
 * @returns {any}
 */
export function publicationPayload(input) {
    const ret = wasm.publicationPayload(input);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A purchase's contest payload (Agreements type 14; rule 54, "Contest
 * (type 14)", F386): the purchase it contests (the buyer's own payer's
 * claim of the payment, or its signature act on an offer at no price),
 * and, optionally, the promise not kept, in words. Signed by the buyer;
 * the act carries, in `objects`, `[purchase, purchase]`. Shown beside the
 * purchase; it voids nothing and moves nothing.
 * @param {string} purchase
 * @param {string | null} [promise]
 * @returns {Uint8Array}
 */
export function purchaseContestPayload(purchase, promise) {
    const ptr0 = passStringToWasm0(purchase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(promise) ? 0 : passStringToWasm0(promise, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.purchaseContestPayload(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Run a rail Module's rule on a commitment before paying (payment cMIP,
 * step 2): what a payer's money app does with an answer's invoice or
 * request, without the completing part of the proof. `module` the rail
 * Module's spec hash; `address` the payee's rail address or vault source;
 * `railProof` the rail proof so far; `chain` the headers the client
 * follows, or null. The answer, as `moneyJudge` gives it.
 * @param {string} module
 * @param {string} commitment
 * @param {any} amount
 * @param {Uint8Array} address
 * @param {Uint8Array} rail_proof
 * @param {any} chain
 * @returns {any}
 */
export function railCheck(module, commitment, amount, address, rail_proof, chain) {
    const ptr0 = passStringToWasm0(module, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(address, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(rail_proof, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.railCheck(ptr0, len0, ptr1, len1, amount, ptr2, len2, ptr3, len3, chain);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} n
 * @returns {Uint8Array}
 */
export function randomBytes(n) {
    const ret = wasm.randomBytes(n);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A commitment read back from its CBOR: its fields and its hash. A
 * commitment naming a bare key as payer, or a purchase, is refused here:
 * Damgar's round 1 makes neither.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function readCommitment(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readCommitment(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Read a grant's payload as the core library decodes it, so a client can
 * name the split service a deal's payees granted (terms field 14) without
 * reading the format itself. Throws if the payload is not a grant.
 * @param {Uint8Array} payload
 * @returns {any}
 */
export function readGrant(payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readGrant(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} payload
 * @returns {any}
 */
export function readKeyDelivery(payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readKeyDelivery(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A Lightning rail address read, or `null` where it is none.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function readLightningAddress(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readLightningAddress(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A Lightning rail proof read: `{ invoice, preimage }`, or `null`.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function readLightningProof(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readLightningProof(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * An on-chain rail address read, or `null`.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function readOnchainAddress(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readOnchainAddress(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * An on-chain rail proof read, or `null`.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function readOnchainProof(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readOnchainProof(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A receipt's or claim's field 1 read: `{ paidTo, salt, rail }`.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function readPaymentProof(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readPaymentProof(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Read a publication's payload (Agreements type 6) as the core decodes
 * it, strictly, before it is signed: every check of its format that reads
 * the payload alone applied ("Publication (type 6)"), so a client says in
 * plain words what signing it means from the exact bytes signed, without
 * reading the format itself. Throws where the payload is not a
 * publication in Agreements' format. What its `objects` must name (the
 * version it follows, `[first, previous]`; its ownership agreement,
 * `[agreement, agreement]`) is read with the act, by
 * `agreementsPublication`, once signed; so is whether a version selling
 * nothing is a later one.
 * @param {Uint8Array} payload
 * @returns {any}
 */
export function readPublication(payload) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readPublication(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Read a terms payload (Agreements type 0) as the core library decodes it, field
 * by field, so a client can say in plain words what signing it means from
 * the exact bytes that are signed (Agreements rule 4a). Throws if the payload is
 * not terms in Agreements' format, or uses a field whose format is still open;
 * `problem` says why terms in the format still fail Agreements' checks.
 * @param {Uint8Array} payload
 * @param {any} specs
 * @returns {any}
 */
export function readTerms(payload, specs) {
    const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.readTerms(ptr0, len0, specs);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Rebuild a collective's chain key from `threshold` shares, each checked,
 * and check it against the dealing's commitment (Module 5.1: the rebuild
 * check; at a rotation, the rotating device). Returns the FIPS 205 seeds to
 * sign one rotation with. **Test collectives only.**
 * @param {Uint8Array[]} shares
 * @returns {any}
 */
export function rebuildChainKey(shares) {
    const ptr0 = passArrayJsValueToWasm0(shares, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rebuildChainKey(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Rebuild a collective's chain key from paper shares alone (H18), checked
 * against the commitment its own chain holds; no dealing needed. Returns the
 * FIPS 205 seeds to sign one rotation with. **Test collectives only**, and
 * the stand-in for Kišib in tests.
 * @param {any} input
 * @returns {any}
 */
export function rebuildChainKeyFromPaper(input) {
    const ret = wasm.rebuildChainKeyFromPaper(input);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A record payload (Agreements type 17): the collective's everyday line. Its act
 * carries, in `objects`, `[clone, clone]`, or, naming no clone, the
 * agreement in force. Checked by the core's decoder before it is returned.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function recordPayload(input) {
    const ret = wasm.recordPayload(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * A resignation payload (Agreements type 16): the whole voice, or, with `area`,
 * stepping down from that area (by id). The act carries, in `objects`,
 * `[agreement, agreement]`. With `drafts`, the versions its signer had
 * signed and leaves behind (F207): none of them ever brings them back.
 * @param {string} agreement
 * @param {number | null} [area]
 * @param {string[] | null} [drafts]
 * @returns {Uint8Array}
 */
export function resignationPayload(agreement, area, drafts) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(drafts) ? 0 : passArrayJsValueToWasm0(drafts, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.resignationPayload(ptr0, len0, isLikeNone(area) ? Number.MAX_SAFE_INTEGER : (area) >>> 0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * A routes payload (Identity type 3), as CBOR.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function routesPayload(input) {
    const ret = wasm.routesPayload(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * The running summary of a sequence of act ids (Envelopes, "Sequences").
 * @param {string[]} ids
 * @returns {string}
 */
export function runningSummary(ids) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.runningSummary(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
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
 * Seal an act, with its content key if private, for its recipients
 * (Envelopes, "Sealed containers"). Randomness is drawn fresh unless given.
 * @param {any} input
 * @returns {Uint8Array}
 */
export function seal(input) {
    const ret = wasm.seal(input);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * What anyone can read of a sealed container: its recipients, and the
 * X-Wing ciphertext of each capsule.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function sealedParts(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sealedParts(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A settlement request payload (Agreements type 22; DQ8, F188): the deal's
 * reference version, the version with two complete clones, whose
 * arbitrator a party who signed it asks to settle the fork. The act
 * carries, in `objects`, `[reference, reference]`.
 * @param {string} reference
 * @returns {Uint8Array}
 */
export function settlementRequestPayload(reference) {
    const ptr0 = passStringToWasm0(reference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.settlementRequestPayload(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * A share as its holder writes it on paper (H18: its number and its value,
 * the blinding dropped), after the holder's own check against the dealing
 * (Module 5.1). Throws if the share does not lie on the commitments.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function shareOnPaper(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.shareOnPaper(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A signature payload (Agreements type 1), as CBOR. The act carries, in
 * `objects`, `[signed, signed]`: a signature follows the act it signs.
 * @param {string} signed
 * @returns {Uint8Array}
 */
export function signaturePayload(signed) {
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

/**
 * @param {Uint8Array} secret
 * @returns {Uint8Array}
 */
export function signingPublic(secret) {
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

/**
 * A transaction's txid (Bitcoin's byte order), from its bytes without witness.
 * @param {Uint8Array} tx
 * @returns {string}
 */
export function txid(tx) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passArray8ToWasm0(tx, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.txid(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * A vault declaration for a genesis or rotation's declarations slot, as
 * the genesis client passes declarations: `{ spec, kind, cbor }`; with no
 * entries (null), `{ spec, kind }`, which removes the vault (Money, "The
 * vault": a null value for kind 0 removes it).
 * @param {string} money_spec
 * @param {any} entries
 * @returns {any}
 */
export function vaultDeclaration(money_spec, entries) {
    const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.vaultDeclaration(ptr0, len0, entries);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The vault a genesis or rotation's declarations slot sets: `undefined`
 * where it says nothing of the vault, `null` where it removes it, else
 * its entries (Money, "The vault").
 * @param {string} money_spec
 * @param {Uint8Array} act
 * @returns {any}
 */
export function vaultOf(money_spec, act) {
    const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(act, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.vaultOf(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A holder's own check of their share against the dealing's commitments
 * (Module 5.1). Throws if it does not lie on them. Returns what the holder
 * compares with every other holder: the dealing's fingerprint.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function verifyShare(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifyShare(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A vow's contest payload (Agreements type 14; Agreements draft 11, rule
 * 13, F253): the sale it contests (the buyer's own payer's claim of the
 * payment, or its signature act on an offer at no price), and, optionally,
 * the promise not kept, in words (reading (Q3)). Signed by the buyer; the
 * act carries, in `objects`, `[vow, vow]`, the vow by its name. It marks
 * that sale contested, and voids nothing.
 * @param {string} vow
 * @param {string} sale
 * @param {string | null} [promise]
 * @returns {Uint8Array}
 */
export function vowContestPayload(vow, sale, promise) {
    const ptr0 = passStringToWasm0(vow, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(sale, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(promise) ? 0 : passStringToWasm0(promise, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    const ret = wasm.vowContestPayload(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * The work hash of a plaintext, `tagged_hash("MOR/work", plaintext)` (Envelopes, "Media").
 * @param {Uint8Array} plaintext
 * @returns {string}
 */
export function workHash(plaintext) {
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

/**
 * @param {Uint8Array} secret
 * @param {Uint8Array} ct
 * @returns {Uint8Array}
 */
export function xwingDecapsulate(secret, ct) {
    const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(ct, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.xwingDecapsulate(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * @param {Uint8Array} _public
 * @param {Uint8Array} eseed
 * @returns {any}
 */
export function xwingEncapsulate(_public, eseed) {
    const ptr0 = passArray8ToWasm0(_public, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(eseed, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.xwingEncapsulate(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} secret
 * @returns {Uint8Array}
 */
export function xwingPublic(secret) {
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
            const ret = typeof(v) === 'bigint' ? v : undefined;
            getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_boolean_get_5b446f51afd21013: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
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
            const ret = typeof(arg0) === 'bigint';
            return ret;
        },
        __wbg___wbindgen_is_function_1f9d30630b8b1d3d: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_e343b7d08827ba72: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_object_3c45d4f2dde4e749: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_string_90b56bc79aad6f6c: function(arg0) {
            const ret = typeof(arg0) === 'string';
            return ret;
        },
        __wbg___wbindgen_is_undefined_8865fb403f8fe9d8: function(arg0) {
            const ret = arg0 === undefined;
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
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_187d372bd5fdd4aa: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_6137034ef55c9d0f: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments); },
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
        __wbg_getRandomValues_c44a50d8cfdaebeb: function() { return handleError(function (arg0, arg1) {
            arg0.getRandomValues(arg1);
        }, arguments); },
        __wbg_get_658f6698067d9515: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
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
            const ret = new Map();
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
        __wbg_next_f4aac29c42af995c: function() { return handleError(function (arg0) {
            const ret = arg0.next();
            return ret;
        }, arguments); },
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
        __wbg_randomFillSync_6c25eac9869eb53c: function() { return handleError(function (arg0, arg1) {
            arg0.randomFillSync(arg1);
        }, arguments); },
        __wbg_require_b4edbdcf3e2a1ef0: function() { return handleError(function () {
            const ret = module.require;
            return ret;
        }, arguments); },
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
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_10fb7dc1ae063179: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_0b583911f537483a: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_d7f903d1508cbdc4: function() {
            const ret = typeof window === 'undefined' ? null : window;
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
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_generic_0000000000000002: function(arg0) {
            // Cast intrinsic for `I64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_generic_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_generic_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_generic_0000000000000005: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./mor_wasm_bg.js": import0,
    };
}

const VerifierFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_verifier_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
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

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
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
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
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
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
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

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('mor_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
