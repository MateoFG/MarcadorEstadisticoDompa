

import * as React from "react"
import { Monitor, Smartphone, Tablet } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useViewMode } from "@/components/view-mode-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode()
  const { t } = useTranslation()

  const Icon = viewMode === 'mobile' ? Smartphone : viewMode === 'tablet' ? Tablet : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Icon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle view mode</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setViewMode("mobile")}>
          {t('mobile')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setViewMode("tablet")}>
          {t('tablet')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setViewMode("desktop")}>
          {t('desktop')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
