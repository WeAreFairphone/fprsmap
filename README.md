#Fairphone Community Map
>_`fprsmap` - abbreviation for "Fairphoners Map"_

##About
The idea for the Fairphone Community Map originated in March 2015 in [a topic][1] on the [Fairphone Forum][2]. The goal is to map the global Fairphone Community and make it easier to find relevant people and places in the user's area.

##Usage
The map can currently be found at https://wearefairphone.github.io/fprsmap/. (It will soon be accessible from a subdomain on https://fairphone.com.) You can embed it on your webpage using an [iframe][3]:

```html
<iframe src="https://wearefairphone.github.io/fprsmap/" width="100%" height="100%" allowfullscreen="true" frameborder="0">
  <p><a href="https://wearefairphone.github.io/fprsmap/" target="_blank">See the Fairphone Community Map!</a></p>
</iframe>
```
Modify the `width` and `height` parameters to your liking.

##Status of the Project
At the moment we are trying to gather as many relevant sources for the map as possible. Therefore we created an [API for the data endpoints][4] that provide the information shown in the map. At the moment we have three categories:

- `meetups` (Meetups & Events of the Fairphone Community)
- `angels` (Local support volunteers, so called _Fairphone Angels_)
- `shops` (Shops where Fairphones can be bought)

*Note: The 4<sup>th</sup> category "Fairphoners Groups" will soon be dropped in favor of the distinction between `meetups` and `angels`.*

##Usage examples
The categories mentioned in the previous paragraph can also be used to define an initial state of the map.

- Say you want to promote Fairphone Community events. Append `?show=meetups` to the URI and only meetups and events will be loaded into the map at start.
- Multiple parameters are also possible: `https://wearefairphone.github.io/fprsmap/?show=meetups,angels` will display both the `meetups` and the `angels` layers.
- By default all layers are loaded.

##Acknowledgements
Thank you to [Fairphone][5] for their great support of community projects. They listen to our needs and take into account our requirements for the map. We are also grateful to [T-Mobile Austria][6] for providing us with data about the locations of their shops.

Last but not least, we want to mention [Leaflet.js][7]. It's really a pleasure to work with their great JavaScript library to build this map!

##Contact information
The developers @Roboe and @StefanBrand can be reached via Twitter:
[@RoboePi][8] | [@StefaBrand][9]


[1]: https://forum.fairphone.com/t/do-you-know-an-open-source-alternative-to-embedded-maps/5088?u=stefan
[2]: https://forum.fairphone.com/
[3]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
[4]: https://github.com/WeAreFairphone/fprsdb
[5]: https://fairphone.com
[6]: http://www.t-mobile.at/
[7]: http://leafletjs.com/
[8]: https://twitter.com/RoboePi
[9]: https://twitter.com/StefaBrand
