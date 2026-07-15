"use client"

import * as React from "react"
import Link from "next/link"
import { Atom, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const categories = [
  {
    title: "Bio-Tech",
    href: "/discover?category=Bio-Tech",
    description: "Genetics, Neuroscience, Biotechnology, Molecular Biology.",
  },
  {
    title: "Cosmos",
    href: "/discover?category=Cosmos",
    description: "Astrophysics, Space Exploration, Cosmology.",
  },
  {
    title: "Life-Science",
    href: "/discover?category=Life-Science",
    description: "Nutritional Biochemistry, Sports Physiology, Circadian Rhythm, Longevity.",
  },
  {
    title: "Deep-Dive",
    href: "/discover?category=Deep-Dive",
    description: "Statistical Analysis, Scientific Theories, Technological Revolutions.",
  },
]

export function MainNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex w-full items-center">
      <div className="mr-6 flex flex-col justify-center">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Atom className="h-6 w-6 text-primary shrink-0" />
          <span className="text-xl font-semibold tracking-tight">ScienceOne<span className="text-primary">.net</span></span>
        </Link>
        <span className="hidden lg:block text-[11px] text-muted-foreground/80 font-medium tracking-wider ml-8 -mt-0.5">
          Where data, theories, and discoveries converge.
        </span>
      </div>

      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent">Categories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-background">
                {categories.map((category) => (
                  <ListItem
                    key={category.title}
                    title={category.title}
                    href={category.href}
                  >
                    {category.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink 
              className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              render={<Link href="/discover" prefetch={false} />}
            >
              Discover
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink 
              className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              render={<Link href="/about" />}
            >
              About Us
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Navigation */}
      <div className="flex flex-1 items-center justify-end md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger 
            render={
              <Button variant="ghost" size="icon" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" />
            }
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-md p-0 font-sans border-l border-primary/10 bg-background/98 backdrop-blur-xl">
            <SheetHeader className="px-6 py-6 text-left border-b border-border/40">
              <SheetTitle className="flex items-center gap-2">
                <Atom className="h-6 w-6 text-primary shrink-0" />
                <span className="font-bold tracking-tight text-xl">ScienceOne<span className="text-primary">.net</span></span>
              </SheetTitle>
              <SheetDescription className="text-foreground/60 font-medium ml-8 mt-1 text-[13px] leading-snug">
                Where data, theories, and discoveries converge.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-8 py-8 px-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 pl-2">Categories</h4>
                {categories.map((category) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-4 py-3.5 rounded-xl bg-muted/40 text-foreground/90 hover:bg-primary/10 hover:text-primary active:scale-[0.98] transition-all font-semibold"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-6 border-t border-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2 pl-2">Menu</h4>
                <Link onClick={() => setOpen(false)} href="/discover" prefetch={false} className="flex items-center px-4 py-3.5 rounded-xl text-foreground/80 hover:bg-muted/60 active:scale-[0.98] transition-all font-semibold">
                  Discover
                </Link>
                <Link onClick={() => setOpen(false)} href="/about" className="flex items-center px-4 py-3.5 rounded-xl text-foreground/80 hover:bg-muted/60 active:scale-[0.98] transition-all font-semibold">
                  About Us
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink
        render={<Link href={href || "#"} prefetch={false} ref={ref as any} />}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus:bg-emerald-50 focus:text-emerald-900",
          className
        )}
        {...props}
      >
        <div className="text-sm font-semibold leading-none text-primary mb-1">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
