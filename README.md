# Fairphone Community Map
>_`fprsmap` - abbreviation for "Fairphoners Map"_

## About
The idea for the Fairphone Community Map originated in March 2015 in [a topic][1] on the [Fairphone Forum][2]. The goal is to map the global Fairphone Community and make it easier to find relevant people and places in the user's area.

The map can currently be found at https://map.fairphone.community/ or at https://wearefairphone.github.io/fprsmap/.

## Status of the Project & Contributions
The project scope is completely defined. One category has turned out to be relevant for the community map:

- `angels` ([Local support volunteers][11], so called _Fairphone Angels_) [[Datasource]][17]

### Fix bugs / develop features
Please look at the [issues list][4] and help us out<sup>*</sup> or give feedback. We are looking forward to your contribution!

<sup>*</sup>: A [how-to for building the map locally][16] can be found in the Wiki.

## Usage examples

The map has been designed to work with different categories where `angels` is the only one that is still supported.
Others - like `repairshops` or `events` have been removed in the past when it no longer made sense to maintain them.
It is still possible to use such a category to define an initial state of the map, even though it will only have a real use case if a new category gets added in the future.

- Say you want to promote Fairphone angels. Append `?show=angels` to the URI and only the locations of our Fairphone angels will be loaded into the map at start.
- Multiple parameters are also possible: `https://map.fairphone.community/?show=events,angels` would display both the `events` and the `angels` layers, i.e. if we still had the `events`.

To further customize the initial state of the map, the following parameters are also possible:

- If you want to center the map on a certain location use `center=<lat>,<lng>` where `<lat>` is the latitude and `<lng>` the longitude (defaults to `center=49.8158683,6.129675`).
- In order to zoom into the map, use `zoom=<value>` where `<value>` is an integer number between 2 and 18 (defaults to `zoom=2`).
- So if you for example want to display the current Fairphone angels in Europe, the whole URI would be `https://map.fairphone.community/?center=49.25346477,7.91015625&zoom=5&show=angels`

Remember to put a "`?`" in front of the first parameter and a "`&`" in front of the others. The order of the parameters is not important.

## Embed the map
Simply click the embed button ![embed icon][icon] inside the map and you will find the embed code ready to be copied. The embed code provided there will update itself according to the layers you select and take into account the current zoom level and location the map is centered on.

The embed code uses an [iframe][3]. You can also have a look at it here:

```html
<iframe src="https://map.fairphone.community/" width="100%" height="400" allowfullscreen="true" frameborder="0">
  <p><a href="https://map.fairphone.community/" target="_blank">See the Fairphone Community Map!</a></p>
</iframe>
```
Modify the `width` and `height` parameters to your liking.

## Acknowledgements
Thank you to [Fairphone][5] for their great support of community projects. They listen to our needs and take into account our requirements for the map.

Last but not least, we want to mention [Leaflet.js][7]. It's really a pleasure to work with their great JavaScript library to build this map!

## Contact information
The developer @Ingo-FP-Angel can be reached via the Fairphone Forum ([@Ingo-FP-Angel][forum-ingo]). If you like, you can also [join the public discussion][13] there.


[1]: https://forum.fairphone.com/t/do-you-know-an-open-source-alternative-to-embedded-maps/5088?u=stefan
[2]: https://forum.fairphone.com/
[3]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
[4]: https://github.com/WeAreFairphone/fprsmap/issues
[5]: https://fairphone.com
[7]: http://leafletjs.com/
[11]: https://forum.fairphone.com/t/angel-the-fairphone-angels-program-local-support-by-community-members/33058?u=stefan
[13]: https://forum.fairphone.com/t/fairphone-community-map/26553?u=stefan
[15]: https://forum.fairphone.com/agenda
[16]: https://github.com/WeAreFairphone/fprsmap/wiki/How-to-build-the-map-locally
[17]: https://forum.fairphone.com/t/data-source-for-fairphone-angels-program/48676?u=stefan

[category-local]: https://forum.fairphone.com/c/participate/local
[forum-ingo]: https://forum.fairphone.com/u/ingo
[icon]: resources/embed-icon.png
