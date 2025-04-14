import {
	Address,
  BigDecimal,
  BigInt,
} from '@graphprotocol/graph-ts'

import {
	ERC20Transfer,
} from '../../generated/schema'

import {
	Transfer as TransferEvent,
} from '../../generated/StandardToken/ERC20'

import {
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../helpers/account'

import {
	fetchERC20,
	fetchERC20Balance,
} from '../helpers/erc20'

export function handleTransfer(event: TransferEvent): void {
	let contract   = fetchERC20(event.address)
	let ev         = new ERC20Transfer(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.value       = decimals.toDecimals(event.params.value, contract.decimals)
	ev.valueExact  = event.params.value

  let mint = false
  let burn = false

	if (event.params.from == Address.zero()) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
    contract.mintCount = contract.mintCount + 1
    mint = true
		totalSupply.save()
	} else {
		let from               = fetchAccount(event.params.from)
		let balance            = fetchERC20Balance(contract, from)
		balance.valueExact     = balance.valueExact.minus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

    if (balance.value.equals(BigDecimal.zero())) {
      contract.holders = contract.holders - 1
    }

		ev.from                = from.id
		ev.fromBalance         = balance.id
	}

	if (event.params.to == Address.zero()) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
    contract.burnCount = contract.burnCount + 1
    burn = true
		totalSupply.save()
	} else {
		let to                 = fetchAccount(event.params.to)
		let balance            = fetchERC20Balance(contract, to)

    if (balance.valueExact.equals(BigInt.zero())) {
      contract.holders = contract.holders + 1
    }
		balance.valueExact     = balance.valueExact.plus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		ev.to                  = to.id
		ev.toBalance           = balance.id
	}
	ev.save()
  if (!mint && !burn) {
    contract.transfersCount = contract.transfersCount + 1
  }
  contract.save()
}
