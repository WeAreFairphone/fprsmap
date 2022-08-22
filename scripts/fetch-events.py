import datetime
import json
import os.path
import re

import requests
import sys

pattern_table = re.compile("^\s*\|")
pattern_date = re.compile("\d{1,2}([/\-.])\d{1,2}([/\-.])\d{4}") # DDMMYYY delimited by one of "/-."
pattern_link_title = re.compile(".*\[[_*]*([\w\s]+)[_*]*].*", re.UNICODE) # ignore italics or bold markdown characters _ and *
pattern_link = re.compile(".*\((https://forum.fairphone.com/t/.*)\)\s")
pattern_coordinates = re.compile(".*<map.*?location=\"(\d+\.\d+)\s*?[/,]\s*?(\d+\.\d+)\".*?/>.*")
pattern_map_title = re.compile(".*<map.*?title=\"([\w\s.]+)\".*?/>.*", re.UNICODE)


class Event:
    def __init__(self, date, location, url, lat, lon: str):
        self.date = date
        self.location = location
        self.url = url
        self.lat = lat
        self.lon = lon

    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)


def is_table_line(line):
    return bool(pattern_table.match(line))


def parse_date(datestr):
    m = pattern_date.match(datestr)
    if m is None:
        return None
    try:
        parsed = datetime.datetime.strptime(datestr, '%d'+m.group(1)+'%m'+m.group(2)+'%Y')
        if parsed >= datetime.datetime.now():
            return parsed.date().strftime("%Y-%m-%d")
        else:
            return None # skip past events
    except:
        return None


def parse_city(forumlink):
    m = pattern_link_title.match(forumlink)
    if m is None:
        return None

    return m.group(1)


def parse_url(forumlink):
    m = pattern_link.match(forumlink)
    if m is None:
        return None

    return m.group(1)


def parse_coordinates(locationcolumn):
    m = pattern_coordinates.match(locationcolumn)
    if m is None:
        return None

    return m.group(1) + "/" + m.group(2)


def parse_location(locationcolumn):
    m = pattern_map_title.match(locationcolumn)
    if m is None:
        return None

    return m.group(1)


def parse_event_from_table(line):
    print("--- New line in event table ---")

    columns = line.split("|")

    date = parse_date(columns[1].replace(' ', ''))
    print("Date: ", date)
    if date is None:
        return None

    url = parse_url(columns[2])
    print("URL : ", url)
    if url is None:
        return None

    coordinates = parse_coordinates(columns[2])
    print("Geo : ", coordinates)
    if coordinates is None:
        return None

    city = parse_city(columns[2])
    print("City: ", city)

    location = parse_location(columns[2])
    print("Titl: ", location)
    if location is None:
        location = city

    print("Loc : ", location)
    if location is None:
        return None

    lat_lon = coordinates.split("/")
    return Event(date, location, url, lat_lon[0], lat_lon[1])


response = requests.get('https://forum.fairphone.com/raw/87870/1')

# if you want to test this script without fetching the real topic every time or need to manipulate the data before
# parsing, save the topic raw data to file, comment out the get call above and use the lines below instead
# file = open(os.path.dirname(os.path.abspath(__file__)) + "/../data/events_topic_raw.txt", 'r')
# response = requests.Response()
# response.status_code = requests.codes.ok
# response._content = str.encode(file.read())

if response.status_code == requests.codes.ok:
    with open(os.path.dirname(os.path.abspath(__file__)) + "/../data/events.json", "w") as file:
        event_table_state = 0  # when we hit the first table markup, we set to 1; when the table is finished we set to 2
        events = []

        for line in response.text.splitlines():
            if is_table_line(line):
                if event_table_state == 0:
                    event_table_state = 1

                event = parse_event_from_table(line)

                if event is not None:
                    events.append(event)
            else:
                if event_table_state == 1:
                    event_table_state = 2

            if event_table_state == 2:
                break # only read the current events, don't read the past events table

        output = "[\n" + ",\n".join(map(lambda x: x.toJson(), events)) + "\n]"
        file.write(output)
else:
    sys.exit(1)
