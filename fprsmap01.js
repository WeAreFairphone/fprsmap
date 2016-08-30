//Custom Marker
var myIcon = L.icon({
	iconUrl: 'FairphoneMarker.png',
	iconSize: [31.8,50],
	iconAnchor: [15.9,49]
});

//Map is initialized
var fprsmap = L.map('mapid').setView([49.8158683,6.1296751], 4);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPLv3</a>',
    maxZoom: 18
}).addTo(fprsmap);

//List of Local Fairphone Communities (Source: https://forum.fairphone.com/t/pencil2-local-fairphoners-address-book-fairphone-communities/3815)
var groups = [
	{loc:'Austria', latlng:[48.2083537,16.3725042], postnr:4},
	{loc:'Canada', latlng:[	43.6529206,-79.3849007], postnr:22},
	//Germany
	{loc:'Aachen', latlng:[50.776351,6.0838618], postnr:6},
	{loc:'Augsburg', latlng:[48.3668041,10.8986971], postnr:12},
	{loc:'Berlin', latlng: [52.5170365,13.3888599], postnr:24},
	{loc:'Bremen', latlng:[53.0758196,8.8071646], postnr:15},
	{loc:'Düsseldorf', latlng:[51.2254018,6.7763137], postnr:8},
	{loc:'Franken', latlng:[49.4538723,11.0772978], postnr:11},
	{loc:'Hamburg', latlng:[53.5503414,10.000654], postnr:20},
	{loc:'München', latlng:[48.1371079,11.5753822], postnr:23},
   {loc:'Saarbrücken', latlng:[49.24717,6.98287], postnr:34},
	{loc:'Stuttgart', latlng:[48.7784485,9.1800132], postnr:7},
	{loc:'Ulm', latlng:[48.3973944,9.9932755], postnr:17},
	//France
   {loc:'Grenoble', latlng:[45.182478,5.7210773], postnr:35},
	{loc:'Paris', latlng:[48.8566101,2.3514992], postnr:13},
   {loc:'Strasbourg', latlng:[48.56908,7.76210], postnr:32},
	//Israel
	{loc:'Israel', latlng:[32.0804808,34.7805274], postnr:25},
	//Netherlands
	{loc:'Leiden', latlng:[52.1598645,4.4824271], postnr:21},
   {loc:'Tilburg', latlng:[51.58508,5.06369], postnr:33}, 
	{loc:'Spain', latlng:[41.3825596,2.1771353], postnr:5},
	//Switzerland
	{loc:'Aarau', latlng:[47.3927146,8.0444448], postnr:14},
	{loc:'United Kingdom', latlng:[51.5073,-0.1277], postnr:28},
	{loc:'Sweden', latlng:[63.8256568,20.2630745], postnr:29},
   {loc:'Turkey', latlng:[41.0096334,28.9651646], postnr:31}
];

//Add a marker per Local Fairphone Community
for(i=0;i<groups.length;i++) {
	L.marker(groups[i].latlng,{icon: myIcon, riseOnHover: true}).addTo(fprsmap)
		.bindPopup('<a href="https://forum.fairphone.com/t/pencil2-local-fairphoners-address-book-fairphone-communities/3815/' + groups[i].postnr + '" target="_blank">' + groups[i].loc + '</a>', {offset: new L.Point(0,-25)});
	//L.circle(groups[i].latlng,50000, {stroke:false}).addTo(fprsmap)
};
