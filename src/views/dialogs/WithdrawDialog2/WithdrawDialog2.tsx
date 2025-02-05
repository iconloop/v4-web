import { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import { mainnet } from 'viem/chains';

import { CHAIN_INFO, isEvmDepositChainId } from '@/constants/chains';
import { DepositDialog2Props, DialogProps } from '@/constants/dialogs';
import { CosmosChainId, NEUTRON_BECH32_PREFIX, OSMO_BECH32_PREFIX } from '@/constants/graz';
import { STRING_KEYS } from '@/constants/localization';
import { SOLANA_MAINNET_ID } from '@/constants/solana';
import { WalletNetworkType } from '@/constants/wallets';

import { useAccounts } from '@/hooks/useAccounts';
import usePrevious from '@/hooks/usePrevious';
import { useStringGetter } from '@/hooks/useStringGetter';

import { Dialog, DialogPlacement } from '@/components/Dialog';

import { useAppDispatch } from '@/state/appTypes';
import { addWithdraw, Withdraw } from '@/state/transfers';

import { convertBech32Address } from '@/lib/addressUtils';

import { ChainSelect } from './ChainSelect';
import { WithdrawForm } from './WithdrawForm';
import { WithdrawStatus } from './WithdrawStatus';

export const WithdrawDialog2 = ({ setIsOpen }: DialogProps<DepositDialog2Props>) => {
  const { dydxAddress, sourceAccount, nobleAddress } = useAccounts();
  const [destinationAddress, setDestinationAddress] = useState(sourceAccount.address ?? '');
  const [destinationChain, setDestinationChain] = useState(
    sourceAccount.chain === WalletNetworkType.Evm
      ? mainnet.id.toString()
      : sourceAccount.chain === SOLANA_MAINNET_ID
        ? SOLANA_MAINNET_ID
        : CosmosChainId.Noble
  );

  const previousChainRef = usePrevious(CHAIN_INFO[destinationChain]?.walletNetworkType);
  const stringGetter = useStringGetter();
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState('');
  const [currentWithdraw, setCurrentWithdraw] = useState<{ txHash: string; chainId: string }>();
  const [formState, setFormState] = useState<'form' | 'chain-select'>('form');
  const chainSelectRef = useRef<HTMLDivElement | null>(null);

  const dialogTitle =
    formState === 'form'
      ? stringGetter({ key: STRING_KEYS.WITHDRAW })
      : stringGetter({ key: STRING_KEYS.SELECT_CHAIN });

  const onShowForm = () => {
    setFormState('form');
    chainSelectRef.current?.scroll({ top: 0 });
  };

  useEffect(() => {
    const currentDestinationChainType = CHAIN_INFO[destinationChain]?.walletNetworkType;

    // Do not update destination address if chainType goes from EVM -> EVM
    // Cosmos uses different Bech32Prefixes for different chains, so it is excluded from this check
    if (
      currentDestinationChainType === WalletNetworkType.Evm &&
      previousChainRef === currentDestinationChainType
    )
      return;

    setDestinationAddress(() => {
      if (dydxAddress) {
        if (destinationChain === CosmosChainId.Neutron) {
          return convertBech32Address({
            address: dydxAddress,
            bech32Prefix: NEUTRON_BECH32_PREFIX,
          });
        }

        if (destinationChain === CosmosChainId.Osmosis) {
          return convertBech32Address({ address: dydxAddress, bech32Prefix: OSMO_BECH32_PREFIX });
        }
      }

      if (destinationChain === CosmosChainId.Noble && nobleAddress) {
        return nobleAddress;
      }

      if (sourceAccount.address != null) {
        const { address: sourceWalletAddress } = sourceAccount;
        if (
          destinationChain === SOLANA_MAINNET_ID &&
          sourceAccount.chain === WalletNetworkType.Solana
        ) {
          return sourceWalletAddress;
        }

        if (
          isEvmDepositChainId(destinationChain) &&
          sourceAccount.chain === WalletNetworkType.Evm
        ) {
          return sourceWalletAddress;
        }
      }

      return '';
    });
  }, [destinationChain, dydxAddress, nobleAddress, sourceAccount]);

  const onWithdraw = (withdraw: Withdraw) => {
    if (!dydxAddress) return;

    setCurrentWithdraw({ txHash: withdraw.txHash, chainId: withdraw.chainId });
    dispatch(addWithdraw({ withdraw, dydxAddress }));
  };

  return (
    <$Dialog
      isOpen
      withAnimation
      hasHeaderBorder
      setIsOpen={setIsOpen}
      slotIcon={formState === 'form' && <div />} // Empty icon to help with center alignment of title
      onBack={formState !== 'form' ? onShowForm : undefined}
      title={<div tw="text-center">{dialogTitle}</div>}
      placement={DialogPlacement.Default}
    >
      {currentWithdraw && (
        <WithdrawStatus
          txHash={currentWithdraw.txHash}
          chainId={currentWithdraw.chainId}
          onClose={() => setIsOpen(false)}
        />
      )}
      {!currentWithdraw && (
        <div tw="w-[100%] overflow-hidden">
          <div tw="flex w-[200%]">
            <div
              tw="w-[50%]"
              style={{ marginLeft: formState === 'form' ? 0 : '-50%', transition: 'margin 500ms' }}
            >
              <WithdrawForm
                amount={amount}
                setAmount={setAmount}
                destinationAddress={destinationAddress}
                setDestinationAddress={setDestinationAddress}
                destinationChain={destinationChain}
                onChainSelect={() => setFormState('chain-select')}
                onWithdraw={onWithdraw}
              />
            </div>
            <div
              ref={chainSelectRef}
              tw="w-[50%] overflow-scroll"
              style={{
                pointerEvents: formState === 'form' ? 'none' : undefined,
                height: formState === 'form' ? 0 : '100%',
              }}
            >
              <ChainSelect
                disabled={formState === 'form'}
                selectedChain={destinationChain}
                setSelectedChain={setDestinationChain}
                onBack={onShowForm}
              />
            </div>
          </div>
        </div>
      )}
    </$Dialog>
  );
};

const $Dialog = styled(Dialog)`
  --dialog-content-paddingTop: 0;
  --dialog-content-paddingRight: 0;
  --dialog-content-paddingBottom: 0;
  --dialog-content-paddingLeft: 0;
`;
