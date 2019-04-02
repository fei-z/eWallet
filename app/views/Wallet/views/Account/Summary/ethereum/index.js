/* @flow */
import styled from 'styled-components';
import React from 'react';
import { H2 } from 'components/Heading';
import Icon from 'components/Icon';
import { AsyncSelect } from 'components/Select';
import colors from 'config/colors';
import Tooltip from 'components/Tooltip';
import Content from 'views/Wallet/components/Content';
import { withNamespaces } from 'react-i18next';
import CoinLogo from 'components/images/CoinLogo';
import Link from 'components/Link';
import { FONT_WEIGHT, FONT_SIZE } from 'config/variables';
import AccountBalance from '../components/Balance';
import PropTypes from "prop-types";
import { inject, observer } from 'mobx-react';
import { getCoinInfo } from 'utils/data/CoinInfo';
import { formatAmount } from 'utils/formatUtils';

const AccountHeading = styled.div`
    padding-bottom: 35px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const H2Wrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 20px 0;
`;

const StyledTooltip = styled(Tooltip)`
    position: relative;
    top: 2px;
`;

const AccountName = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const AccountTitle = styled.div`
    font-size: ${FONT_SIZE.WALLET_TITLE};
    font-weight: ${FONT_WEIGHT.MEDIUM};
    color: ${colors.WALLET_TITLE};
`;

const StyledIcon = styled(Icon)`
    position: relative;
    top: -7px;
    
    &:hover {
        cursor: pointer;
    }
`;

const AsyncSelectWrapper = styled.div`
    padding-bottom: 32px;
`;

const AddedTokensWrapper = styled.div``;

class AccountSummary extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.getCurrentNetworkbyShortcut = this.getCurrentNetworkbyShortcut.bind(this);
  }

  componentDidMount(): void {
    const { appState } = this.props;
    appState.getEthereumAccountInfo().then();
    appState.updateRate().then();
  }

  getCurrentNetworkbyShortcut(shortcut: string) {
    const { localStorage } = this.props.appState;

    const networks = localStorage.networks
      .filter(n => n.shortcut.toLowerCase() === shortcut.toLowerCase());
    if (networks && networks.length === 0) {
      return null;
    }
    return networks[0];
  }

  render() {
    const { t } = this.props;
    const { wallet } = this.props.appState;
    const {accountEth, rates} = wallet;
    if (!accountEth) {
      const loader = {
        type: 'progress',
        title: t('Loading account'),
      };
      return <Content loader={loader} isLoading />;
    }
    const network = this.getCurrentNetworkbyShortcut('eth');
    const fiat = rates ? [{
      network: network.shortcut.toLowerCase(),
      value: rates.ethereum[wallet.currency.toLowerCase()],
    }] : [];

    const externalAddress = `https://etherscan.io/address/${accountEth.address}`;
    return (
      <Content>
        <React.Fragment>
          <AccountHeading>
            <AccountName>
              <CoinLogo network="eth"/>
              <AccountTitle>
                { t('Account') } #{parseInt("0", 10) + 1}
              </AccountTitle>
            </AccountName>
            <Link openExternal={externalAddress} isGray>
              { t('See full transaction history') }
            </Link>
          </AccountHeading>
          <AccountBalance
            network={network}
            balance={accountEth.balance}
            fiat={fiat}
            currency={wallet.currency.toUpperCase()}
          />
        </React.Fragment>
      </Content>
    );
  }
}

AccountSummary.propTypes = {
  appState: PropTypes.object.isRequired
};

export default withNamespaces()(inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountSummary)));
