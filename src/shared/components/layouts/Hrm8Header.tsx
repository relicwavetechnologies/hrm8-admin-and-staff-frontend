import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/shared/components/ui/breadcrumb";

export function Hrm8Header() {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="/hrm8/dashboard">
                                Dashboard
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
}
