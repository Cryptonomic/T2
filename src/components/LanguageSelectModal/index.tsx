// import React, { Component } from 'react';
// import Modal from 'react-modal';
// import RootRef from '@material-ui/core/RootRef';

// import Button from '../Button';
// import languageLogoIcon from '../../../resources/imgs/Language_Selection_img.svg';
// import localesMap from '../../constants/LocalesMap';

// import {
//   Container, Title, Description, MainContainer,
//   LanguageLogo, GroupContainerWrapper, FadeOut, FadeTop,
//   FadeBottom, RadioGroupContainer, FormControlLabelWrapper,
//   CustomRadio, ButtonContainer, CheckedCircle, NonCheckedCircle
// } from './style';

// const customStyles = {
//   content: {
//     alignItems: 'center',
//     border: '0',
//     borderRadius: '0',
//     top: 'auto',
//     bottom: 0,
//     display: 'flex',
//     justifyContent: 'center',
//     left: 0,
//     width: '100%'
//   },
//   overlay: {
//     backgroundColor: 'rgba(155, 155, 155, 0.68)'
//   }
// };

// type Props = {
//   isOpen: boolean,
//   onLanguageChange: () => {},
//   onContinue: () => {},
//   selectedLanguage: string,
//   t: () => {}
// };
// class LanguageSelectModal extends Component<Props> {

//   constructor(props) {
//     super(props);
//     this.langScrollEl = null;
//   }

//   state = {
//     isTopFade: false,
//     isBottomFade: false,
//     numberOfLocales: 0
//   };

//   componentWillMount = () => {
//     const numberOfLocales = Object.keys(localesMap).length;
//     if (numberOfLocales < 6) {
//       this.setState({ isBottomFade: false, numberOfLocales });
//     } else {
//       this.setState({ isBottomFade: true, numberOfLocales });
//     }
//   }

//   setLanguageScrollRef = (element) => {
//     this.langScrollEl = element;
//     if (this.langScrollEl) {
//       const { selectedLanguage } = this.props;
//       const index = Object.keys(localesMap).indexOf(selectedLanguage);
//       if (index>4) {
//         this.langScrollEl.scrollTop = 40 * (index - 4);
//       }
//     }
//   }

//   onScrollChange = (event) => {
//     const { numberOfLocales } = this.state;
//     const pos = event.target.scrollTop;
//     const remainCount = numberOfLocales - 5;
//     if (pos === 0 ) {
//       this.setState({isTopFade : false, isBottomFade: true });
//     } else if (pos < remainCount*40) {
//       this.setState({isTopFade : true, isBottomFade: true });
//     } else {
//       this.setState({isTopFade : true, isBottomFade: false });
//     }
//   }

//   render() {
//     const { isOpen, onLanguageChange, selectedLanguage, onContinue, t } = this.props;
//     const { isTopFade, isBottomFade } = this.state;
//     return (
//       <Modal isOpen={isOpen} style={customStyles} ariaHideApp={false}>
//         <Container>
//           <Title>{t("components.languageSelectModal.choose_language")}</Title>
//           <Description>{t("components.languageSelectModal.language_selection_description")}</Description>
//           <MainContainer>
//             <LanguageLogo src={languageLogoIcon} />
//             <GroupContainerWrapper>
//               {isTopFade && <FadeTop />}
//               <RootRef rootRef={this.setLanguageScrollRef}>
//                 <RadioGroupContainer
//                   value={selectedLanguage}
//                   onChange={(event)=>onLanguageChange(event.target.value)}
//                   onScroll={this.onScrollChange}
//                 >
//                   {
//                     Object.keys(localesMap).map((key) => {
//                       return (
//                         <FormControlLabelWrapper
//                           value={key}
//                           key={key}
//                           control={
//                             <CustomRadio
//                               icon={<NonCheckedCircle />}
//                               checkedIcon={<CheckedCircle />}
//                             />
//                           }
//                           label={localesMap[key]}
//                         />
//                       );
//                     })
//                   }
//                 </RadioGroupContainer>
//               </RootRef>

//               {isBottomFade && <FadeBottom />}
//             </GroupContainerWrapper>

//           </MainContainer>
//           <ButtonContainer>
//             <Button buttonTheme="primary" onClick={onContinue}>
//               {t("general.verbs.continue")}
//             </Button>
//           </ButtonContainer>
//         </Container>
//       </Modal>
//     );
//   }
// };

// export default wrapComponent(LanguageSelectModal);
