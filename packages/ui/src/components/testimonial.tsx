import Link from "next/link"
import Image from "next/image"
import { Button } from "@repo/ui/components/ui/button"
import { TcardProps } from "@repo/middleware/types"


export default function Testimonial({ idTestimonial }: { idTestimonial: TcardProps }) {
    return (
        <section className="flex flex-col items-center justify-center px-6 py-16">
            <div className="max-w-[1000px] w-full flex flex-col items-center">

                {/* Section Heading */}
                <h2 className="text-foreground text-sm font-semibold tracking-[0.2em] uppercase mb-4 text-center">
                    {idTestimonial.header?.title}
                </h2>

                <h1 className="text-foreground tracking-tight text-2xl md:text-4xl font-bold leading-tight text-center pb-8 max-w-2xl">
                    {idTestimonial.header?.highlight}
                </h1>

                {/* Testimonial */}
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">

                    {/* Avatar*/}
                    {idTestimonial.avatar?.source && (
                        <div className="mb-8 w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden bg-muted relative">
                            <Image
                                src={idTestimonial.avatar.source}
                                alt={idTestimonial.avatar.alternate || "avatar"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Name */}
                    <div className="mb-6">
                        <p className="text-foreground text-base font-bold leading-none mb-1">
                            {idTestimonial.avatarDetails?.label}
                        </p>

                        <p className="text-foreground text-xs uppercase tracking-widest">
                            {idTestimonial.avatarDetails?.description}
                        </p>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-foreground text-lg md:text-xl font-light italic leading-relaxed text-center max-w-[600px] mx-auto mb-8">
                        "{idTestimonial.header?.subtitle}"
                    </blockquote>
                </div>

                {/* Footer */}
                <h4 className="text-foreground text-lg md:text-2xl font-semibold text-center uppercase mb-4">
                    {idTestimonial.header?.badge}
                </h4>

                {idTestimonial.buttons?.map((btn, index) => (
                    <Button key={index} asChild size="lg" className="gap-2">
                        {btn.href && (
                            <Link href={btn.href}>
                                {btn.label}
                            </Link>
                        )}
                    </Button>
                ))}
            </div>
        </section>
    )
}