import { MsgExecuteContractEncodeObject } from 'cosmwasm'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { toUtf8 } from '@cosmjs/encoding'
import { Currency, Token, Coin } from './Wager.types'
export interface WagerMessage {
  contractAddress: string
  sender: string
  wager: (
    {
      token,
      currency,
      against_currencies,
      expiry,
    }: {
      token: Token
      currency: Currency
      against_currencies: Currency[]
      expiry: number
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
  cancel: (
    {
      token,
    }: {
      token: Token
    },
    funds?: Coin[],
  ) => MsgExecuteContractEncodeObject
}
export class WagerMessageComposer implements WagerMessage {
  sender: string
  contractAddress: string

  constructor(sender: string, contractAddress: string) {
    this.sender = sender
    this.contractAddress = contractAddress
    this.wager = this.wager.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  wager = (
    {
      token,
      currency,
      against_currencies,
      expiry,
    }: {
      token: Token
      currency: Currency
      against_currencies: Currency[]
      expiry: number
    },
    funds?: Coin[],
  ): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            wager: { token, currency, against_currencies, expiry },
          }),
        ),
        funds,
      }),
    }
  }

  cancel = (
    {
      token,
    }: {
      token: Token
    },
    funds?: Coin[],
  ): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(
          JSON.stringify({
            cancel: { token },
          }),
        ),
        funds,
      }),
    }
  }
}
