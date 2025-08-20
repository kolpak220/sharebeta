import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonOverlay() {
  return (
    <div className="flex items-center space-x-4 ">
      <Skeleton className="h-12 w-12 rounded-full s" />
      <div 
        className="space-y-3 justify-between"
      >
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  )
}

export function SkeletonOverlayAbout() {
  return (
    <div className="flex flex-col space-x-4 space-y-2 ">
      <Skeleton className="h-4 w-[100%]" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  )
}