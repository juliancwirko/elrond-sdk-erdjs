import * as errors from "../errors";
import { InteractionChecker } from "./interactionChecker";
import { SmartContract } from "./smartContract";
import { BigUIntType, BigUIntValue, OptionalType, OptionalValue, OptionValue, TokenIdentifierValue, U32Value, U64Value } from "./typesystem";
import { loadAbiRegistry } from "../testutils";
import { SmartContractAbi } from "./abi";
import { Address } from "../address";
import { assert } from "chai";
import { Interaction } from "./interaction";
import { Balance } from "../balance";
import BigNumber from "bignumber.js";
import { BytesValue } from "./typesystem/bytes";

describe("integration tests: test checker within interactor", function () {
    let dummyAddress = new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");
    let checker = new InteractionChecker();

    it("should detect errors for 'ultimate answer'", async function () {
        let abiRegistry = await loadAbiRegistry(["src/testdata/answer.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["answer"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let endpoint = abi.getEndpoint("getUltimateAnswer");

        // Send value to non-payable
        assert.throw(() => {
            let interaction = (<Interaction>contract.methods.getUltimateAnswer()).withValue(Balance.egld(1));
            checker.checkInteraction(interaction, endpoint);
        }, errors.ErrContractInteraction, "cannot send EGLD value to non-payable");

        // Bad arguments
        assert.throw(() => {
            let interaction = (<Interaction>contract.methods.getUltimateAnswer([BytesValue.fromHex("abba")]));
            checker.checkInteraction(interaction, endpoint);
        }, errors.ErrContractInteraction, "bad arguments, expected: 0, got: 1");
    });

    it("should detect errors for 'lottery'", async function () {
        let abiRegistry = await loadAbiRegistry(["src/testdata/lottery-esdt.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["Lottery"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let endpoint = abi.getEndpoint("start");

        // Bad number of arguments
        assert.throw(() => {
            let interaction = contract.methods.start([
                BytesValue.fromUTF8("lucky"),
                new BigUIntValue(Balance.egld(1).valueOf()),
                OptionValue.newMissing()
            ]);
            checker.checkInteraction(interaction, endpoint);
        }, errors.ErrContractInteraction, "bad arguments, expected: 9, got: 3");

        // Bad types (U64 instead of U32)
        assert.throw(() => {
            let interaction = contract.methods.start([
                BytesValue.fromUTF8("lucky"),
                new TokenIdentifierValue(Buffer.from("lucky-token")),
                new BigUIntValue(1),
                OptionValue.newMissing(),
                OptionValue.newProvided(new U32Value(1)),
                OptionValue.newProvided(new U32Value(1)),
                OptionValue.newMissing(),
                OptionValue.newMissing(),
                new OptionalValue(new OptionalType(new BigUIntType()))
            ]);
            checker.checkInteraction(interaction, endpoint);
        }, errors.ErrContractInteraction, "type mismatch at index 4, expected: Option<u64>, got: Option<u32>");
    });
});
