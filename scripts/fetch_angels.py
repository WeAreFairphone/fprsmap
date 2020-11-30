import json, os.path, re, requests, yaml

response = requests.get('https://forum.fairphone.com/raw/48676/1')

if response.status_code == requests.codes.ok :
    with open(os.path.dirname(os.path.abspath(__file__)) + "/../data/angels.json","w") as file:
        json.dump(yaml.safe_load(response.text), file, indent=2)

def parse_group(group_forum):
    gf = group_forum

    metadata = gf['bio_cooked']
    metadata_json = re.search('{.*}', metadata).group(0)
    metadata_json = metadata_json.replace('“', '"').replace('”', '"')

    gf.update(**json.loads(metadata_json)['metadata'])

    #<details>\\n<summary>.*<\/summary>\S*({.*}).*<\/details>

    group_map = dict(
        location=gf['name'].split('_')[1],
        angels_count=gf['user_count'],
        aliases=gf['aliases'],
        country=gf['country'],
        coordinates=gf['coordinates']

    )
    return group_map
