NoDistractions - Google Search Distraction Blocker

## Features and Use

This extension allows for you to block yourself from searching for certain sites or topics. It does this in two ways:

1. It allows you to redirect away from a search if it contains a blocked domain or a blocked word

2. On the Google Search Results page, any result that features either a blocked word or domain will be removed.

Word and site blocking are seperate, allowing for customization of what appears in your searches.

The extension features pages for both sites that allows for customization of how each of these are blocked.

Some features of the blocking pages include:

- Add one block at a time
- Add multiple blocks at a time (Under a valid file structure)
- Decide whether a search is entirely blocked if it contains a word/domain or if its just removed from the results page
- For words, add a per-word whitelist to each word that will allow a search wuth that word to go through if it also contains a word in the whitelist. For example, if you block "war" and give it a whitelist of "game", then "war" will be blocked when you search, but "war game" will not be.
- For domains, change where the domain will redirect you to if it is accessed.

Additional Features:
The extension also allows the user to block some of the miscellanious sections of the Google Search Results. Examples include the "Overview" Section that appears on the side of some searches or the "News" section that appears near certain topics

A Universal Whitelist that acts the same as the per-word whitelist but works on every word.

Blocking a word example:

When searching for Michael Jackson normally:
![Alt text](READMEIMGS/MJBefore.png)

When searching for Michael Jackson after setting "Block Results":
![Alt text](READMEIMGS/MJAfter.png)

When searching for Michael Jackson after setting "Block Search":
![Demo GIF](READMEIMGS/michaeljackson%20search%20block.gif)

The same thing as above will happen for site domains that you block.

## Permissions

This extensions requests the following permissions:

- `declarativeNetRequest` and `declarativeNetRequestWithHostAccess`:  
  Used to block or redirect network requests to specified sites and domains directly in the browser.

- `storage`:  
  Used to save your block lists and settings locally in Chrome’s storage.

- `host_permissions` (`*://*.google.com/search*`):  
  Allows the extension to access and modify content only on Google Search pages, which is necessary to block or remove search results and site links.

These permissions are required for the extension to block sites and words and manage your block lists

## License

This project is licensed under the MIT License.
