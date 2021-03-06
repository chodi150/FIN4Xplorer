import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import Box from '../../components/Box';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { getContractData, contractCall } from '../../components/Contractor';
import Container from '../../components/Container';
import GovNavComponent from './GovNavComponent';
import { TCRactive } from '../../components/utils';
import ContractFormSimple from '../../components/ContractFormSimple';
const BN = require('bignumber.js');

function Management(props, context) {
	const { t } = useTranslation();

	const [isDelegateModalOpen, setDelegateModalOpen] = useState(false);
	const [isRefundDelegationModalOpen, setRefundDelegationModalOpen] = useState(false);

	const [govTokenDelegateeBalance, setGovTokenDelegateeBalance] = useState(null);

	let delegatedToMeFetched = useRef(false);

	useEffect(() => {
		if (TCRactive && !delegatedToMeFetched.current && props.contracts.GOV && props.contracts.GOV.initialized) {
			delegatedToMeFetched.current = true;
			fetchDelegatedToMe();
		}
	});

	const fetchDelegatedToMe = () => {
		getContractData(context.drizzle.contracts.GOV, props.defaultAccount, 'getAmountsDelegatedToMe').then(balanceBN => {
			setGovTokenDelegateeBalance(new BN(balanceBN).toNumber());
		});
	};

	const claimGOV = () => {
		contractCall(
			context,
			props,
			props.defaultAccount,
			'REP',
			'getGOVFromReputation',
			[],
			'Claim GOV from REP',
			{},
			true // TODO why does dry-run fail?
		);
	};

	const toggleDelegateModal = () => {
		setDelegateModalOpen(!isDelegateModalOpen);
	};

	const toggleRefundDelegationModal = () => {
		setRefundDelegationModalOpen(!isRefundDelegationModalOpen);
	};

	return (
		<>
			<GovNavComponent />
			<Container>
				<Box title="Governance Token Balances" width="600px">
					<Table headers={['Token', 'Balance', 'Actions']}>
						<TableRow
							key="rep-token"
							data={{
								token: 'Reputation Token',
								balance:
									props.contracts.REP &&
									props.contracts.REP.initialized &&
									props.usersFin4GovernanceTokenBalances[context.drizzle.contracts.REP.address] !== undefined
										? props.usersFin4GovernanceTokenBalances[context.drizzle.contracts.REP.address]
										: '?',
								actions: <Button onClick={claimGOV}>Claim GOV</Button>
							}}
						/>
						<TableRow
							key="gov-token"
							data={{
								token: 'Governance Token',
								balance:
									props.contracts.GOV &&
									props.contracts.GOV.initialized &&
									props.usersFin4GovernanceTokenBalances[context.drizzle.contracts.GOV.address] !== undefined
										? props.usersFin4GovernanceTokenBalances[context.drizzle.contracts.GOV.address]
										: '?',
								actions: ''
							}}
						/>
					</Table>
				</Box>
				<Box title="Delegation" width="600px">
					<Table headers={['Type', 'Amount']}>
						<TableRow
							key="delegatee"
							data={{
								type: 'GOV tokens delegated to me',
								amount: govTokenDelegateeBalance === null ? '?' : govTokenDelegateeBalance
							}}
						/>
					</Table>
					<Button onClick={toggleDelegateModal} center="true">
						Delegate
					</Button>
					<Button onClick={toggleRefundDelegationModal} center="true">
						Refund delegation
					</Button>
					<Modal
						isOpen={isDelegateModalOpen}
						handleClose={toggleDelegateModal}
						title="Delegate GOV tokens"
						width="400px">
						<ContractFormSimple
							contractName="GOV"
							contractMethod="delegate"
							pendingTxStr="Delegate GOV"
							fields={[['Delegator address', 'text'], ['Amount', 'number']]}
							callbacks={{
								transactionSent: () => {
									toggleDelegateModal();
								}
							}}
						/>
					</Modal>
					<Modal
						isOpen={isRefundDelegationModalOpen}
						handleClose={toggleRefundDelegationModal}
						title="Refund delegated GOV tokens"
						width="400px">
						<ContractFormSimple
							contractName="GOV"
							contractMethod="refundDelegation"
							pendingTxStr="Delegate GOV"
							fields={[['Delegator address', 'text'], ['Amount', 'number']]}
							callbacks={{
								transactionSent: () => {
									toggleRefundDelegationModal();
								}
							}}
						/>
					</Modal>
				</Box>
			</Container>
		</>
	);
}

Management.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		defaultAccount: state.fin4Store.defaultAccount,
		contracts: state.contracts,
		usersFin4GovernanceTokenBalances: state.fin4Store.usersFin4GovernanceTokenBalances
	};
};

export default drizzleConnect(Management, mapStateToProps);
