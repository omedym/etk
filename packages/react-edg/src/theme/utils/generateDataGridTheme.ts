import type { AliasToken } from 'antd/es/theme/internal';

/**
 * Generate Data Grid theme based on antd token theme.
 * Documentation: https://ant.design/docs/react/customize-theme#theme
 */
export const generateDataGridTheme = (token: AliasToken) => {
  return {
    token: {
      primary: {
        base: token.colorPrimary,
        hover: token.colorPrimaryHover,
        active: token.colorPrimaryActive,
      },
      info: {
        base: token.colorInfo,
        hover: token.colorInfoHover,
        active: token.colorInfoActive,
      },
      link: {
        base: token.colorLink,
        hover: token.colorLinkHover,
        active: token.colorLinkActive,
      },

      success: token.colorSuccess,
      warning: token.colorWarning,
      error: token.colorError,

      background: {
        base: token.colorBgBase,
        layout: token.colorBgLayout,
        mask: token.colorBgMask,
        primary: token.colorPrimaryBg,
        info: token.colorInfoBg,
        error: token.colorErrorBg,
        warning: token.colorWarningBg,
        success: token.colorSuccessBg,
      },

      border: {
        base: token.colorBorder,
        secondary: token.colorBorderSecondary,
        primary: token.colorPrimaryBorder,
        error: token.colorErrorBorder,
        success: token.colorSuccessBorder,
        warning: token.colorWarningBorder,
        info: token.colorInfoBorder,
      },

      text: {
        base: token.colorTextBase,
        secondary: token.colorTextSecondary,
        tertiary: token.colorTextTertiary,
        quaternary: token.colorTextQuaternary,
        description: token.colorTextDescription,
        disabled: token.colorTextDisabled,
        placeholder: token.colorTextPlaceholder,
        heading: token.colorTextHeading,
        label: token.colorTextLabel,
      },
    },

    breakpoint: {
      mobileS: 320,
      mobileM: 375,
      mobileL: 425,
      tablet: 768,
      laptop: 1024,
      laptopL: 1440,
      desktop: 2560,
    },
  };
};
