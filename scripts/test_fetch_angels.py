import json
from fetch_angels import parse_group

def test_parse_group():
    group_expected = {
      "location": "munich",
      "aliases": [
        "Muenchen"
      ],
      "country": "de",
      "angels_count": 1,
      "coordinates": [
        [
          48.1371079,
          11.5753822
        ]
      ]
    }

    group_forum_json = json.loads(r'{"groups":[{"id":53,"automatic":false,"name":"angels_munich","user_count":1,"mentionable_level":99,"messageable_level":99,"visibility_level":0,"primary_group":false,"title":"","grant_trust_level":null,"flair_url":null,"flair_bg_color":"","flair_color":"","bio_cooked":"<p>Group with all active Munich Angels. Send request for local Angels support to it.</p>\n<details>\n<summary>\nTechnical group details</summary>\n<p>{“metadata”: {“aliases”: [“Muenchen”],“country”: “de”,“coordinates”: [[48.1371079,11.5753822]]}}</p>\n</details>","bio_excerpt":"Group with all active Munich Angels. Send request for local Angels support to it. \n<details><summary>Technical group details</summary>{“me&hellip;</details>","public_admission":false,"public_exit":false,"allow_membership_requests":false,"full_name":"Munich Angels","default_notification_level":3,"membership_request_template":"","members_visibility_level":0,"can_see_members":true,"publish_read_state":false}]}')
    group_forum = group_forum_json['groups'][0]

    assert  parse_group(group_forum) == group_expected
