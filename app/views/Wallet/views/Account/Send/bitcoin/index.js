/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Select } from 'components/Select';
import Button from 'components/Button';
import Input from 'components/inputs/Input';
import Icon from 'components/Icon';
import Link from 'components/Link';
import ICONS from 'config/icons';
import { FONT_SIZE, FONT_WEIGHT, TRANSITION } from 'config/variables';
import colors from 'config/colors';
import Title from 'views/Wallet/components/Title';
import P from 'components/Paragraph';
import Content from 'views/Wallet/components/Content';
// import AdvancedForm from './components/AdvancedForm';
// import PendingTransactions from '../components/PendingTransactions';
import { inject, observer } from 'mobx-react';
import { isValidAddress } from 'utils/addressUtils';
import QrModal from 'components/modals/QrModal';
import ConfirmAction from 'components/modals/confirm/Action';
import type { parsedURI } from 'utils/cryptoUriParser';
import { FADE_IN } from 'config/animations';
import { withNamespaces } from "react-i18next";

const NUMBER_RE: RegExp = new RegExp('^(0|0\\.([0-9]+)?|[1-9][0-9]*\\.?([0-9]+)?|\\.[0-9]+)$');
// TODO: Decide on a small screen width for the whole app
// and put it inside config/variables.js
const SmallScreenWidth = '850px';

const AmountInputLabelWrapper = styled.div`
    display: flex;
    justify-content: space-between;
`;

const AmountInputLabel = styled.span`
    text-align: right;
    color: ${colors.TEXT_SECONDARY};
`;

const InputRow = styled.div`
    padding-bottom: 28px;
`;

const SetMaxAmountButton = styled(Button)`
    height: 40px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: ${FONT_SIZE.SMALL};
    font-weight: ${FONT_WEIGHT.SMALLEST};
    color: ${colors.TEXT_SECONDARY};

    border-radius: 0;
    border: 1px solid ${colors.DIVIDER};
    border-right: 0;
    border-left: 0;
    background: transparent;
    transition: ${TRANSITION.HOVER};

    &:hover {
        background: ${colors.GRAY_LIGHT};
    }

    ${props => props.isActive && css`
        color: ${colors.WHITE};
        background: ${colors.GREEN_PRIMARY};
        border-color: ${colors.GREEN_PRIMARY};

        &:hover {
            background: ${colors.GREEN_SECONDARY};
        }

        &:active {
            background: ${colors.GREEN_TERTIARY};
        }
    `}
`;

const CurrencySelect = styled(Select)`
    min-width: 77px;
    height: 40px;
    flex: 0.2;
`;

const FeeOptionWrapper = styled.div`
    display: flex;
    justify-content: space-between;
`;

const OptionValue = styled(P)`
    flex: 1 0 auto;
    min-width: 70px;
    margin-right: 5px;
`;

const OptionLabel = styled(P)`
    flex: 0 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    word-break: break-all;
`;

const FeeLabelWrapper = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 10px;
`;

const FeeLabel = styled.span`
    color: ${colors.TEXT_SECONDARY};
`;

const UpdateFeeWrapper = styled.span`
    margin-left: 8px;
    display: flex;
    align-items: center;
    font-size: ${FONT_SIZE.SMALL};
    color: ${colors.WARNING_PRIMARY};
`;

const StyledLink = styled(Link)`
    margin-left: 4px;
    white-space: nowrap;
`;

const ToggleAdvancedSettingsWrapper = styled.div`
    min-height: 40px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media screen and (max-width: ${SmallScreenWidth}) {
        ${props => (props.isAdvancedSettingsHidden && css`
            flex-direction: column;
        `)}
    }
`;

const ToggleAdvancedSettingsButton = styled(Button)`
    min-height: 40px;
    padding: 0;
    display: flex;
    flex: 1 1 0;
    align-items: center;
    font-weight: ${FONT_WEIGHT.SEMIBOLD};
`;

const FormButtons = styled.div`
    display: flex;
    flex: 1 1;

    
    @media screen and (max-width: ${SmallScreenWidth}) {
        margin-top: ${props => (props.isAdvancedSettingsHidden ? '10px' : 0)};
    }

    Button + Button {
        margin-left: 5px;
    }
`;

const SendButton = styled(Button)`
  flex: 1;
  margin-right: 5px;
  width: 100px;
`;

const ClearButton = styled(Button)`

`;

const AdvancedSettingsIcon = styled(Icon)`
    margin-left: 10px;
`;

const QrButton = styled(Button)`
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-left: 0px;
    height: 40px;
    padding: 0 10px;
`;

const ModalContainer = styled.div`
    position: fixed;
    z-index: 10000;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    padding: 20px;
    animation: ${FADE_IN} 0.3s;
`;

const ModalWindow = styled.div`
    margin: auto;
    position: relative;
    border-radius: 4px;
    background-color: ${colors.WHITE};
    text-align: center;
`;

class AccountSend extends React.Component<Props> {
  state = {
    // for address
    address: '',
    addressErrors: null,
    addressWarnings: null,
    addressInfos: null,
    // for amount
    amount: '',
    amountErrors: null,
    amountWarnings: null,
    amountInfos: null,
    isSetMax: false,
    //
    isSending: false,
    //
    selectedFeeLevel: null,
    feeLevels: null,
    // for qr scan
    isQrScanning: false,
  };

  network = this.getCurrentNetworkbyShortcut('btc');
  constructor(props) {
    super(props);
    // const network = this.getCurrentNetworkbyShortcut('btc');
    this.state = {
      // for address
      address: '',
      addressErrors: null,
      addressWarnings: null,
      addressInfos: null,
      // for amount
      amount: '',
      amountErrors: null,
      amountWarnings: null,
      amountInfos: null,
      isSetMax: false,
      //
      isSending: false,
      //
      feeLevels: [
        {
          value: 'High',
          label: this.network.defaultFees.High,
        },
        {
          value: 'Normal',
          label: this.network.defaultFees.Normal,
        },
        {
          value: 'Economy',
          label: this.network.defaultFees.Economy,
        },
        {
          value: 'Low',
          label: this.network.defaultFees.Low,
        }
      ],
      selectedFeeLevel: {
        value: 'High',
        label: this.network.defaultFees.High,
      },
      //
      isQrScanning: false,
    };

    this.getAddressInputState = this.getAddressInputState.bind(this);
    this.getAmountInputState = this.getAmountInputState.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onAmountChange = this.onAmountChange.bind(this);
    this.onSetMax = this.onSetMax.bind(this);
    this.onFeeLevelChange = this.onFeeLevelChange.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onQrScan = this.onQrScan.bind(this);
    this.onQrScanCancel = this.onQrScanCancel.bind(this);
    this.openQrModal = this.openQrModal.bind(this);
    this.onSend = this.onSend.bind(this);
    this.callback = this.callback.bind(this);
    this.getCurrentNetworkbyShortcut = this.getCurrentNetworkbyShortcut.bind(this);
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

  getAddressInputState(): string {
    let state = '';
    if (this.state.address && !this.state.addressErrors) {
      state = 'success';
    }
    if (this.state.addressWarnings && !this.state.addressErrors) {
      state = 'warning';
    }
    if (this.state.addressErrors) {
      state = 'error';
    }
    return state;
  };

  getAmountInputState(): string {
    let state = '';
    if (this.state.amountWarnings && !this.state.amountErrors) {
      state = 'warning';
    }
    if (this.state.amountErrors) {
      state = 'error';
    }
    return state;
  };

  onAddressChange(address: string) {
    this.setState({ address: address });
    if (address.length < 1) {
      this.setState({
        address: address,
        addressErrors: 'Address is not set',
      });
    } else if (!isValidAddress(address, this.network)) {
      this.setState({
        address: address,
        addressErrors: 'Address is not valid',
      });
    } else {
      this.setState({
        address: address,
        addressErrors: null,
        addressWarnings: null,
        addressInfos: null,
      });
    }
  }

  onAmountChange(amount: string) {
    if (amount.length < 1) {
      this.setState({
        amount: amount,
        amountErrors: 'Amount is not set'
      });
    } else if (amount.length > 0 && !amount.match(NUMBER_RE)) {
      this.setState({
        amount: amount,
        amountErrors: 'Amount is not a number'
      });
    } else {
      this.setState({
        amount: amount,
        amountErrors: null,
        amountWarnings: null,
        amountInfos: null,
      });
    }
  }

  onSetMax() {
    // TODO: 计算 max 并设置 this.state.amount
    this.setState({isSetMax: !this.state.isSetMax})
  }

  onFeeLevelChange(selectedFee) {
    this.setState({selectedFeeLevel: selectedFee})
  }

  onClear() {
    this.setState({
      address: '',
      addressErrors: null,
      addressWarnings: null,
      addressInfos: null,
      // for amount
      amount: '',
      amountErrors: null,
      amountWarnings: null,
      amountInfos: null,
      isSetMax: false,
      //
      isSending: false,
    })
  }

  callback(result: boolean) {
    if (result) {
      this.onClear();
    } else {
      this.setState({isSending: false})
    }
  }

  openQrModal() {
    this.setState({
      isQrScanning: true,
    })
  }

  onQrScanCancel() {
    this.setState({
      isQrScanning: false,
    })
  }

  onQrScan(parsedUri: parsedURI) {
    const { address = '', amount } = parsedUri;
    if (amount) {
      this.setState({
        address: address,
        amount: amount,
      })
    } else {
      this.setState({
        address: address,
      })
    }
    this.onAddressChange(address);
  }

  onSend() {
    const { appState } = this.props;
    const address = this.state.address;
    const amount = this.state.amount;
    const fee = this.state.selectedFeeLevel.label;
    this.setState({isSending: true});
    appState.btcComposeTransaction(address, amount, fee, true, this.callback).then();
  }

  render() {
    const { appState, t } = this.props;
    const { wallet, eWalletDevice } = this.props.appState;

    const {account, rates} = wallet;
    if (!account || !rates) {
      const loader = {
        type: 'progress',
        title: t('Loading account'),
      };
      return <Content loader={loader} isLoading />;
    }

    if (!!appState.wallet.buttonRequest_SignTx) {
      return (
        <ModalContainer>
          <ModalWindow>
            <ModalContainer>
              <ModalWindow>
                <ConfirmAction device={eWalletDevice.device} />
              </ModalWindow>
            </ModalContainer>
          </ModalWindow>
        </ModalContainer>
      )
    }

    if (appState.wallet.buttonRequest_ConfirmOutput) {
      return (
        <ModalContainer>
          <ModalWindow>
            <ConfirmAction device={eWalletDevice.device} />
          </ModalWindow>
        </ModalContainer>
      )
    }

    if (this.state.isQrScanning) {
      return (
        <ModalContainer>
          <ModalWindow>
            <QrModal
              onCancel={this.onQrScanCancel}
              onScan={parsedUri => this.onQrScan(parsedUri)}
            />
          </ModalWindow>
        </ModalContainer>
      )
    }

    const currencySelectOption = [
      { value: this.network.shortcut, label: this.network.shortcut },
    ];

    return (
      <Content>
        <Title>{t('Send Bitcoin(BTC)')}</Title>
        <InputRow>
          <Input
            state={this.getAddressInputState()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            topLabel={t('Address')}
            bottomText={this.state.addressErrors || this.state.addressWarnings || this.state.addressInfos}
            value={this.state.address}
            onChange={event => this.onAddressChange(event.target.value)}
            sideAddons={[(
              <QrButton
                key="qrButton"
                isWhite
                onClick={this.openQrModal}
              >
                <Icon
                  size={25}
                  color={colors.TEXT_SECONDARY}
                  icon={ICONS.QRCODE}
                />
              </QrButton>
            )]}
          />
        </InputRow>
        <InputRow>
          <Input
            state={this.getAmountInputState()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            topLabel={(
              <AmountInputLabelWrapper>
                <AmountInputLabel>
                  {t('Amount')}
                </AmountInputLabel>
              </AmountInputLabelWrapper>
            )}
            value={this.state.amount}
            onChange={event => this.onAmountChange(event.target.value)}
            bottomText={this.state.amountErrors || this.state.amountWarnings || this.state.amountInfos}
            sideAddons={[
              // (
              //   <SetMaxAmountButton
              //     key="icon"
              //     onClick={() => this.onSetMax()}
              //     isActive={this.state.isSetMax}
              //   >
              //     {!this.state.isSetMax && (
              //       <Icon
              //         icon={ICONS.TOP}
              //         size={25}
              //         color={colors.TEXT_SECONDARY}
              //       />
              //     )}
              //     {this.state.isSetMax && (
              //       <Icon
              //         icon={ICONS.CHECKED}
              //         size={25}
              //         color={colors.WHITE}
              //       />
              //     )}
              //     Set max
              //   </SetMaxAmountButton>
              // ),
              (
                <CurrencySelect
                  key="currency"
                  isSearchable={false}
                  isClearable={false}
                  value={currencySelectOption}
                  isDisabled={true}
                  // onChange={onCurrencyChange}
                  options={[currencySelectOption]}
                />
              )
            ]}
          />
        </InputRow>
        <InputRow>
          <FeeLabelWrapper>
            <FeeLabel>
              {t('Fee')}
            </FeeLabel>
          </FeeLabelWrapper>
          <Select
            isSearchable={false}
            isClearable={false}
            value={this.state.selectedFeeLevel}
            onChange={this.onFeeLevelChange}
            options={this.state.feeLevels}
            formatOptionLabel={option => (
              <FeeOptionWrapper>
                <OptionValue>{option.value}</OptionValue>
                <OptionLabel>{option.label}</OptionLabel>
              </FeeOptionWrapper>
            )}
          />
        </InputRow>

        <ToggleAdvancedSettingsWrapper isAdvancedSettingsHidden>
          <FormButtons isAdvancedSettingsHidden>
            <ClearButton
              isWhite
              isDisabled={this.state.isSending}
              onClick={() => this.onClear()}
            >
              {t('Clear')}
            </ClearButton>
            <SendButton
              isDisabled={this.state.isSending}
              onClick={() => this.onSend()}
            >
              {t('Send')}
            </SendButton>
          </FormButtons>
        </ToggleAdvancedSettingsWrapper>
      </Content>
    );
  }
}

AccountSend.propTypes = {
  appState: PropTypes.object.isRequired
};

export default withNamespaces()(inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountSend)));
