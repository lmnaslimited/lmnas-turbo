
export type TtrendsPageSource  = {
    heroSection: TheroSection

}

export type TheroSection = {
        heading: Theading
        description: string
        buttons: Tbutton[]  
}

export type Theading = {
    title: string
    subtitle: string
    highlight: string
    badge: string
  
}

export type Thighlight = {
    icon: string
    label: string
    description: string
}
export type Tbutton = {
    icon: string
    fromMode: string
    description: string
    label: string
    href: string
}
