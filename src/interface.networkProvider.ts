import { BigNumber } from "bignumber.js";
import { Balance, GasLimit, GasPrice, Nonce, TransactionPayload } from ".";
import { AccountOnNetwork } from "./account";
import { Address } from "./address";
import { Hash } from "./hash";
import { NetworkConfig } from "./networkConfig";
import { NetworkStake } from "./networkStake";
import { NetworkStatus } from "./networkStatus";
import { NFTToken } from "./nftToken";
import { Signature } from "./signature";
import { Query, QueryResponse } from "./smartcontracts";
import { Stats } from "./stats";
import { Token } from "./token";
import { Transaction, TransactionHash, TransactionStatus } from "./transaction";

/**
 * An interface that defines the endpoints of an HTTP API Provider.
 */
export interface INetworkProvider {
    /**
     * Fetches the Network configuration.
     */
    getNetworkConfig(): Promise<NetworkConfig>;

    /**
     * Fetches the Network status.
     */
    getNetworkStatus(): Promise<NetworkStatus>;

    /**
     * Fetches stake statistics.
     */
    getNetworkStakeStatistics(): Promise<NetworkStake>;

    /**
     * Fetches general statistics.
     */
    getNetworkGeneralStatistics(): Promise<Stats>;

    /**
     * Fetches the state of an {@link Account}.
     */
    getAccount(address: Address): Promise<AccountOnNetwork>;

    /**
     * Fetches data about the fungible tokens held by an account.
     */
    getFungibleTokensOfAccount(address: Address, pagination?: Pagination): Promise<IFungibleTokenOfAccountOnNetwork[]>;

    /**
     * Fetches data about the non-fungible tokens held by account.
     */
    getNonFungibleTokensOfAccount(address: Address, pagination?: Pagination): Promise<INonFungibleTokenOfAccountOnNetwork[]>;

    /**
     * Fetches data about a specific fungible token held by an account.
     */
    getFungibleTokenOfAccount(address: Address, tokenIdentifier: string): Promise<IFungibleTokenOfAccountOnNetwork>;

    /**
     * Fetches data about a specific non-fungible token (instance) held by an account.
     */
    getNonFungibleTokenOfAccount(address: Address, collection: string, nonce: Nonce): Promise<INonFungibleTokenOfAccountOnNetwork>;

    /**
     * Fetches the state of a {@link Transaction}.
     */
    getTransaction(txHash: TransactionHash): Promise<ITransactionOnNetwork>;

    /**
     * Queries the status of a {@link Transaction}.
     */
    getTransactionStatus(txHash: TransactionHash): Promise<TransactionStatus>;

    /**
     * Broadcasts an already-signed {@link Transaction}.
     */
    sendTransaction(tx: Transaction): Promise<TransactionHash>;

    /**
     * Simulates the processing of an already-signed {@link Transaction}.
     * 
     * TODO: Return explicit type.
     */
    simulateTransaction(tx: Transaction): Promise<TransactionHash>;

    /**
     * Queries a Smart Contract - runs a pure function defined by the contract and returns its results.
     */
    queryContract(query: Query): Promise<QueryResponse>;

    /**
     * Fetches the definition of a fungible token.
     * 
     * TODO: Rename to "GetDefinitionOfFungibleToken" or "GetFungibleTokenDefinition" (not renamed yet in order to preserve interface compatibility).
     */
    getToken(tokenIdentifier: string): Promise<Token>;

    /**
     * Fetches the definition of a SFT (including Meta ESDT) or NFT.
     * 
     * TODO: Return explicit type.
     */
    getDefinitionOfTokenCollection(collection: string): Promise<any>;

    /**
     * Fetches an instance of a SFT (including Meta ESDT) or NFT.
     * 
     * TODO: Rename to "GetTokenInstance" (not renamed yet in order to preserve interface compatibility).
     */
    getNFTToken(tokenIdentifier: string): Promise<NFTToken>;

    /**
     * Performs a generic GET action against the provider (useful for new HTTP endpoints, not yet supported by erdjs).
     */
    doGetGeneric(resourceUrl: string): Promise<any>;

    /**
     * Performs a generic POST action against the provider (useful for new HTTP endpoints, not yet supported by erdjs).
     */
    doPostGeneric(resourceUrl: string, payload: any): Promise<any>;
}

export interface IFungibleTokenOfAccountOnNetwork {
    tokenIdentifier: string;
    balance: BigNumber;
}

export interface INonFungibleTokenOfAccountOnNetwork {
    tokenIdentifier: string;
    collection: string;
    attributes: Buffer;
    balance: BigNumber;
    nonce: Nonce;
    creator: Address;
    royalties: BigNumber;
}

export interface ITransactionOnNetwork {
    hash: TransactionHash;
    nonce: Nonce;
    round: number;
    epoch: number;
    value: Balance;
    receiver: Address;
    sender: Address;
    gasPrice: GasPrice;
    gasLimit: GasLimit;
    data: TransactionPayload;
    signature: Signature;
    status: TransactionStatus;
    timestamp: number;
    blockNonce: Nonce;
    hyperblockNonce: Nonce;
    hyperblockHash: Hash;
}

export class Pagination {
    from: number = 0;
    size: number = 100;

    static default(): Pagination {
        return { from: 0, size: 100 };
    }
}
