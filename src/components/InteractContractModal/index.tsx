import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { OperationKindType } from 'conseiljs';
import SwipeableViews from 'react-swipeable-views';
import { withTranslation, WithTranslation } from 'react-i18next';
import Loader from '../Loader';
import DeployContract from './DeployContract';
import InvokeContract from './InvokeContract';

import { fetchFeesThunk } from '../../reduxContent/app/thunks';
import { OPERATIONFEE, AVERAGEFEES } from '../../constants/FeeValue';
import { ModalWrapper, ModalContainer, ModalTitle, CloseIconWrapper } from './style';
import themes from '../../styles/theme';
import { RootState } from '../../types/store';
import { RegularAddress, AverageFees } from '../../types/general';

const styles: any = {
  tabsRoot: {},
  tabsIndicator: {
    height: 0
  },
  tabRoot: {
    textTransform: 'initial',
    opacity: 1,
    height: '60px',
    backgroundColor: themes.colors.accent,
    color: themes.colors.white,
    '&$tabSelected': {
      color: themes.colors.primary,
      backgroundColor: themes.colors.white
    }
  },
  tabLabel: {
    fontWeight: 500,
    fontSize: '16px'
  },
  tabSelected: {}
};

const useStyles = makeStyles(styles);

interface OwnProps {
  addresses: RegularAddress[];
  open: boolean;
  onClose: () => void;
}

interface StoreProps {
  isLoading: boolean;
  selectedParentHash: string;
  fetchFees: (op: OperationKindType) => Promise<AverageFees>;
}

type Props = OwnProps & StoreProps & WithTranslation;

function InteractContractModal(props: Props) {
  const classes = useStyles();
  const { fetchFees, selectedParentHash, isLoading, open, t, onClose, addresses } = props;
  const [activeTab, setActiveTab] = useState(0);
  const [averageFees, setAverageFees] = useState<AverageFees>(AVERAGEFEES);
  const [enterCounts, setEnterCounts] = useState<number[]>([0, 0]);

  async function getFees() {
    const newFees = await fetchFees(OperationKindType.Transaction);
    if (newFees.low < OPERATIONFEE) {
      newFees.low = OPERATIONFEE;
    }
    setAverageFees({ ...newFees });
  }

  useEffect(() => {
    getFees();
  }, [selectedParentHash]);

  function onEnterPress(event) {
    if (event.key === 'Enter') {
      enterCounts[activeTab] += 1;
      setEnterCounts(enterCounts);
    }
  }

  return (
    <ModalWrapper open={open} onKeyDown={onEnterPress}>
      {open ? (
        <ModalContainer>
          <CloseIconWrapper onClick={() => onClose()} />
          <ModalTitle>{t('components.interactModal.title')}</ModalTitle>
          <Tabs
            classes={{
              root: classes.tabsRoot,
              indicator: classes.tabsIndicator
            }}
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="fullWidth"
          >
            <Tab
              classes={{
                root: classes.tabRoot,
                selected: classes.tabSelected
                // label: classes.tabLabel
              }}
              label={t('components.interactModal.invoke_contract')}
            />
            <Tab
              classes={{
                root: classes.tabRoot,
                selected: classes.tabSelected
                // label: classes.tabLabel
              }}
              label={t('components.interactModal.deploy_contract')}
            />
          </Tabs>

          <SwipeableViews index={activeTab}>
            <InvokeContract
              enterNum={enterCounts[0]}
              addresses={addresses}
              averageFees={averageFees}
              onClose={onClose}
            />
            <DeployContract
              enterNum={enterCounts[1]}
              addresses={addresses}
              averageFees={averageFees}
              onClose={onClose}
            />
          </SwipeableViews>
          {isLoading && <Loader />}
        </ModalContainer>
      ) : (
        <ModalContainer />
      )}
    </ModalWrapper>
  );
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.app.isLoading,
  selectedParentHash: state.app.selectedParentHash
});

const mapDispatchToProps = dispatch => ({
  fetchFees: (op: OperationKindType) => dispatch(fetchFeesThunk(op))
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(InteractContractModal) as React.ComponentType<OwnProps>;
