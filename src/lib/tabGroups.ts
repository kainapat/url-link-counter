export type TabGroupingCapability = 'unavailable' | 'extension'

export type TabGroupColor =
  | 'grey'
  | 'blue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'orange'

export type TabGroupOptions = {
  title?: string
  color?: TabGroupColor
}

export type TabGroupResult = {
  success: boolean
  groupId?: number
  tabIds?: number[]
  error?: string
}

export interface TabGroupBridge {
  readonly capability: TabGroupingCapability
  isAvailable(): boolean
  openInGroup(urls: string[], options?: TabGroupOptions): Promise<TabGroupResult>
}

/**
 * Standard Web platform implementation.
 * Regular web applications in any browser (Chrome, Brave, Opera, Safari, mobile browsers)
 * do not have access to chrome.tabs or chrome.tabGroups Extension APIs.
 * This bridge accurately reports capability as 'unavailable' and never fakes grouping.
 */
export class WebTabGroupBridge implements TabGroupBridge {
  readonly capability: TabGroupingCapability = 'unavailable'

  isAvailable(): boolean {
    return false
  }

  async openInGroup(_urls: string[], _options?: TabGroupOptions): Promise<TabGroupResult> {
    return {
      success: false,
      error: 'Automatic tab grouping is unavailable to standard websites. A browser extension is required.',
    }
  }
}

export const defaultTabGroupBridge: TabGroupBridge = new WebTabGroupBridge()
