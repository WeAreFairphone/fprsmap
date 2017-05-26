# Fairphone Community Map
>_`fprsmap` - abbreviation for "Fairphoners Map"_

## About
The idea for the Fairphone Community Map originated in March 2015 in [a topic][1] on the [Fairphone Forum][2]. The goal is to map the global Fairphone Community and make it easier to find relevant people and places in the user's area.

## Embed the map
The map can currently be found at https://wearefairphone.github.io/fprsmap/ or at http://map.fairphone.community. You can embed it on your webpage using an [iframe][3]:

```html
<iframe src="https://wearefairphone.github.io/fprsmap/" width="100%" height="400" allowfullscreen="true" frameborder="0">
  <p><a href="https://wearefairphone.github.io/fprsmap/" target="_blank">See the Fairphone Community Map!</a></p>
</iframe>
```
Modify the `width` and `height` parameters to your liking.

## Status of the Project & Contributions
At the moment we are trying to gather as many relevant sources for the map as possible. Please look at the [issues list][4] and help us out or give feedback. We are looking forward to your contribution! The idea is to eventually have four categories:

- `meetups` (Meetups & Events of the Fairphone Community)
- `angels` ([Local support volunteers][11], so called _Fairphone Angels_)
- `repairshops` ([Repair shops][14] that are familiar with Fairphones)
- `shops` (Shops where Fairphones can be bought)
- `communities` (Fairphoners Groups)

*Note: The 5<sup>th</sup> category `communities` reflects the content of the [Local Fairphoners Address Book][10]. It may be dropped in favor of the distinction between `meetups` and `angels`. Till then you can post in the Address Book and we will add you(r group) to the map.*

## Usage examples
The categories mentioned in the previous paragraph can be used to define an initial state of the map.

- Say you want to promote Fairphone Community events. Append `?show=meetups` to the URI and only meetups and events will be loaded into the map at start.
- Multiple parameters are also possible: `https://wearefairphone.github.io/fprsmap/?show=meetups,angels` will display both the `meetups` and the `angels` layers.
- By default all layers are loaded.

## Acknowledgements
Thank you to [Fairphone][5] for their great support of community projects. They listen to our needs and take into account our requirements for the map. We are also grateful to [T-Mobile Austria][6] for providing us with data about the locations of their shops.

Last but not least, we want to mention [Leaflet.js][7]. It's really a pleasure to work with their great JavaScript library to build this map!

## Contact information
The developers @Roboe and @StefanBrand can be reached via Twitter ([@RoboePi][8] | [@StefaBrand][9]) or [Matrix][12]. If you like, you can also [join the discussion][13] on the Fairphone Forum.


[1]: https://forum.fairphone.com/t/do-you-know-an-open-source-alternative-to-embedded-maps/5088?u=stefan
[2]: https://forum.fairphone.com/
[3]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
[4]: https://github.com/WeAreFairphone/fprsmap/issues
[5]: https://fairphone.com
[6]: http://www.t-mobile.at/
[7]: http://leafletjs.com/
[8]: https://twitter.com/RoboePi
[9]: https://twitter.com/StefaBrand
[10]: https://forum.fairphone.com/t/local-fairphoners-address-book-fairphone-communities/3815?u=stefan
[11]: https://forum.fairphone.com/t/local-technical-support-by-community-members-mailing-lists-project-description/26193?u=stefan
[12]: https://chat.disroot.org/#/room/#fprsmap:disroot.org
[13]: https://forum.fairphone.com/t/fairphone-community-map/26553?u=stefan
[14]: https://forum.fairphone.com/t/pencil2-list-of-local-repair-shops-that-are-familiar-with-fairphones-by-city/19032?u=stefan
