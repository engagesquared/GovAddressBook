import {
  teamsDarkV2Theme,
  teamsHighContrastTheme,
  teamsV2Theme,
  ThemePrepared,
} from "@fluentui/react-northstar";

export const getTheme = (themeName?: string): ThemePrepared<any> => {
  switch (themeName) {
    case "dark":
      return teamsDarkV2Theme;
    case "contrast":
      return teamsHighContrastTheme;
    case "default":
      return teamsV2Theme;
    default:
      return teamsV2Theme;
  }
};

export interface ITeamsColorSchema {
    default: ITeamsDefaultColorSchema;
    brand: ITeamsBrandColorSchema;
    red: ITeamsRedColorSchema;
    green: ITeamsGreenColorSchema;
    yellow: ITeamsYellowColorSchema;
    orange: ITeamsOrangeColorSchema;
    // ... add more if you need
}

/*////////////////////////////////////////////////////////////////////////////////////////////////
add necessary schemes from: https://fluentsite.z22.web.core.windows.net/
////////////////////////////////////////////////////////////////////////////////////////////////*/
export interface ITeamsDefaultColorSchema {
    foreground: string;
    background: string;
    border: string;
    shadow: string;
    foregroundHover: string;
    backgroundHover: string;
    borderHover: string;
    shadowHover: string;
    foregroundActive: string;
    backgroundActive: string;
    borderActive: string;
    foregroundFocus: string;
    backgroundFocus: string;
    borderFocus: string;
    foregroundPressed: string;
    backgroundPressed: string;
    borderPressed: string;
    foregroundDisabled: string;
    backgroundDisabled: string;
    borderDisabled: string;
    foreground1: string;
    foreground2: string;
    foreground3: string;
    foreground4: string;
    background1: string;
    background2: string;
    background3: string;
    background4: string;
    background5: string;
    border1: string;
    border2: string;
    border3: string;
    foregroundHover1: string;
    foregroundHover2: string;
    backgroundHover1: string;
    backgroundHover2: string;
    backgroundHover3: string;
    backgroundHover4: string;
    backgroundPressed3: string;
    foregroundActive1: string;
    backgroundActive1: string;
    borderActive1: string;
    borderActive2: string;
    borderActive3: string;
    foregroundFocus1: string;
    foregroundFocus2: string;
    foregroundFocus3: string;
    backgroundFocus1: string;
    backgroundFocus2: string;
    backgroundFocus3: string;
    borderFocusWithin: string;
    foregroundDisabled1: string;
    backgroundDisabled1: string;
    backgroundDisabled2: string;
    backgroundDisabled3: string;
}
export interface ITeamsBrandColorSchema {
    foreground: string;
    background: string;
    border: string;
    shadow: string;
    foregroundHover: string;
    backgroundHover: string;
    borderHover: string;
    shadowHover: string;
    foregroundActive: string;
    backgroundActive: string;
    borderActive: string;
    foregroundFocus: string;
    backgroundFocus: string;
    borderFocus: string;
    foregroundPressed: string;
    backgroundPressed: string;
    borderPressed: string;
    foregroundDisabled: string;
    backgroundDisabled: string;
    borderDisabled: string;
    foreground1: string;
    foreground2: string;
    foreground3: string;
    foreground4: string;
    background1: string;
    background2: string;
    background3: string;
    background4: string;
    border1: string;
    border2: string;
    foregroundHover1: string;
    foregroundHover2: string;
    backgroundHover1: string;
    backgroundHover2: string;
    foregroundPressed1: string;
    foregroundActive1: string;
    foregroundActive2: string;
    backgroundActive1: string;
    borderActive1: string;
    borderActive2: string;
    foregroundFocus1: string;
    foregroundFocus2: string;
    foregroundFocus3: string;
    foregroundFocus4: string;
    backgroundFocus1: string;
    backgroundFocus2: string;
    backgroundFocus3: string;
    borderFocusWithin: string;
    borderFocus1: string;
    foregroundDisabled1: string;
    backgroundDisabled1: string;
}
export interface ITeamsRedColorSchema {
    foreground: string;
    background: string;
    border: string;
    foregroundHover: string;
    backgroundHover: string;
    foregroundPressed: string;
    backgroundPressed: string;
    foreground1: string;
    foreground2: string;
    background1: string;
    background2: string;
    background3: string;
    backgroundHover1: string;
}
export interface ITeamsGreenColorSchema {
    foreground: string;
    background: string;
    foreground1: string;
    foreground2: string;
}
export interface ITeamsYellowColorSchema {
    foreground: string;
    background: string;
    foreground1: string;
    foreground2: string;
    background1: string;
    background2: string;
}

export interface ITeamsOrangeColorSchema {
    foreground: string;
    background: string;
    border: string;
    foreground1: string;
}
