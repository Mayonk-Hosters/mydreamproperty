import React from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  EmailIcon,
} from "react-share";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  iconSize?: number;
  media?: string; // Image URL for platforms that support it
}

export function ShareButtons({
  url,
  title,
  description = "",
  className,
  iconSize = 32,
  media,
}: ShareButtonsProps) {
  // Ensure URL is absolute
  const shareUrl = url.startsWith("http") ? url : window.location.origin + url;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="transition-transform hover:scale-110">
              <FacebookShareButton 
                url={shareUrl} 
                hashtag="#realestate"
              >
                <FacebookIcon size={iconSize} round />
              </FacebookShareButton>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Facebook</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="transition-transform hover:scale-110">
              <TwitterShareButton 
                url={shareUrl} 
                title={title} 
                hashtags={["realestate", "property"]}
              >
                <TwitterIcon size={iconSize} round />
              </TwitterShareButton>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Twitter</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="transition-transform hover:scale-110">
              <WhatsappShareButton 
                url={shareUrl} 
                title={title}
              >
                <WhatsappIcon size={iconSize} round />
              </WhatsappShareButton>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on WhatsApp</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="transition-transform hover:scale-110">
              <LinkedinShareButton 
                url={shareUrl} 
                title={title} 
                summary={description} 
                source="My Dream Property"
              >
                <LinkedinIcon size={iconSize} round />
              </LinkedinShareButton>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on LinkedIn</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="transition-transform hover:scale-110">
              <EmailShareButton 
                url={shareUrl} 
                subject={title} 
                body={`Check out this property: ${description}\n\n${shareUrl}`}
              >
                <EmailIcon size={iconSize} round />
              </EmailShareButton>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share via Email</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}