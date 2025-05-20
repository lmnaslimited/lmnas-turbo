import { BluemapleLogo, MindfreshLogo, SGBCzexhTrafoLogo, SGBIndiaLogo } from "@repo/ui/svg/svgs";
import { JSX } from "react";
import { Timage } from "@repo/middleware";

export default function GetIcon({
    iconName
  }: {
    iconName: Timage["svg"]
  }): JSX.Element {
    switch (iconName) {
        case "SGBIndiaLogo":
            return <SGBIndiaLogo />;
        case "SGBCzexhTrafoLogo":
            return <SGBCzexhTrafoLogo />;
        case "MindfreshLogo":
            return <MindfreshLogo />;
        case "BluemapleLogo":
            return <BluemapleLogo />;
        default:
            return <div>Icon</div>;
    }}