import json, os.path, requests

response = requests.get('https://forum.fairphone.com/agenda.json')

if response.status_code == requests.codes.ok :
    events_file = open(os.path.dirname(__file__) + "/../data/events.json","w")
    json.dump(response.json(), events_file, indent=2)
    events_file.close()
