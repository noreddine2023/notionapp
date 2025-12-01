/**
 * UI Components Barrel Export
 * 
 * Architecture Decision: Barrel files provide cleaner imports throughout
 * the application. Instead of importing from individual files, consumers
 * can import from '@/components/ui'.
 */

export { Avatar, AvatarImage, AvatarFallback } from "./avatar";
export { Badge, badgeVariants } from "./badge";
export { Button, buttonVariants } from "./button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
export { Input } from "./input";
export { Label } from "./label";
export { ScrollArea, ScrollBar } from "./scroll-area";
export { Separator } from "./separator";
export { Skeleton } from "./skeleton";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";
