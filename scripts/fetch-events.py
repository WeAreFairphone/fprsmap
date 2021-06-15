import json, os.path, requests

response = requests.get('https://forum.fairphone.com/agenda.json')

if response.status_code == requests.codes.ok :
    with open(os.path.dirname(os.path.abspath(__file__)) + "/../data/events.json","w") as file:
        json.dump(response.json()['topic_list']['topics'], file, indent=2)
