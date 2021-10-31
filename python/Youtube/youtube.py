import configparser
import os
import requests
import json
import threading
import re
import sys
import json
import requests
from bs4 import BeautifulSoup
from pytchat import LiveChatAsync
import asyncio
from dotenv import dotenv_values
import pytchat
from pathlib import Path
from re import search

config = configparser.ConfigParser()
# Get the absolute path of where the python file is running
path_to_python_file = os.path.dirname(__file__)
# Go back 2 folders to end up in the main folder structure
path_to_working_directory = str(Path(path_to_python_file).parents[1])
# Get the config.ini file in the directory
path_config_file = os.path.join(path_to_working_directory, 'config\\Settings.ini')
# Read the config file
config.read(path_config_file)

# Read Environment variables from .env file
envVariables = {
    **dotenv_values("././.env"),  # load shared development variables
}

try:
    api_key = os.environ["YOUTUBEAPIKEY"]
    consoleMessage_dict = {'Type':'Console','Message':"YOUTUBE_API_KEY:"+api_key}
    json_dict = json.dumps(consoleMessage_dict)
    print (json_dict, flush=True)
except Exception:
    api_key = ''
    
channel_id = config['YOUTUBE']['CHANNEL_ID']
channel_name = config['YOUTUBE']['CHANNEL_NAME']
use_youtube_api_key = config['YOUTUBE']['USE_YOUTUBE_API_KEY']

def emoteSubstitutionYT(emote):
    return emote

def transform_Youtube_Emotes(message):
    ignoreChar=False
    emoteYT=""
    transformedMessage=""
    #for character in message:
    
    #counter=0
    
    for i in range(len(message)):
        if(message[i] == ':'):
            #Every pair of ':' is contains an icon
            #Every ':' changes the ignore flag for the following letters
            ignoreChar= not ignoreChar
        else:
            if ( (len(emoteYT)>0) and (not ignoreChar) ):
                #If the ignore flag has been set to false and there is an icon pending, fetch the URL and add it to the message
                transformedMessage+=emoteSubstitutionYT(emoteYT)
            if (ignoreChar):
                #If the ignore flag is true, then the current char must be part of the emote name
                emoteYT+=message[i]
            else:
                #If the ignore flag is false, then the current char is added 'as is' to the transformed message
                transformedMessage+=message[i]




        # if (counter%2 !=0):  #odd counter number means still waiting for next ':'
        #     emoteYT+=message[i]
        
        # if (message[i]==':'):
        #     counter+=1
        #     if(counter%2 ==0):
        #         emoteSubstitutionYT(emoteYT)

# Header needs to be send in order to get response
headers = {
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
}

# Cookie needs to be send in order to get response
cookies={
    'CONSENT': 'YES+42'
}

# Send request to youtube with headers and cookies
def get(url: str):
    try:
        r = requests.get(url, headers=headers,cookies=cookies)
        return r.text
    except requests.RequestException:
        pass

def get_livestream_id_with_YouTube_API_KEY(channel_id : str):
    
    base_url = "https://www.googleapis.com/youtube/v3/search?"
    
    params = {
        "part" : "snippet",
        "channelId" : channel_id,
        "eventType" : "live",
        "type" : "video",
        "key" : api_key
    }

    r = requests.get(base_url, params=params)
    rr = json.loads(r.content)
    video_id = rr['items'][0]['id']['videoId']

    return video_id

def get_livestream_id_without_Youtube_API_KEY(channel_id: str):
    
    # Check if streamer is live by going to his 'live' page, this will contain elements where we can identify if the channel is live or not through the redirected page
    # then parse the html to get the livestream_id
    def check_if_channel_is_live(html: str):
       
        # check if user inserted channel_name or channel_id in configuration
        if  channel_name:
            html = get('https://www.youtube.com/c/' + channel_name + '/live')
        elif channel_id:
            html = get('https://www.youtube.com/channel/' + channel_id + '/live')
        else:
            consoleMessage_dict = {'Type':'Console','Message':'No Channel_id nor Channel_name inserted'}
            json_dict = json.dumps(consoleMessage_dict)
            print (json_dict, flush=True)
            return True
        
         # Analyze the obtained html
        soup = BeautifulSoup(html,"html.parser")
        
        # Get the link that has 'canonical' as relation, this is the livestream redirect link
        livestream_link = soup.find_all('link', {'href': True, 'rel': 'canonical'})
        
        if search('watch',str(livestream_link[0])):
            return get_livestream_id((livestream_link[0]['href']))
        else:
            consoleMessage_dict = {'Type':'Console','Message':'Channel is not Live'}
            json_dict = json.dumps(consoleMessage_dict)
            print (json_dict, flush=True)
            return 
                
    # Extract the livestream_id with regular expression
    def get_livestream_id(item: str):
        livestream_item = re.search(r'([^\=]+$)',item)
        livestream_id =livestream_item.group(0)
        return livestream_id

    return check_if_channel_is_live(channel_id)

# Parse the html to get the livestream_id
def get_user_avatar(user_id: str):
    html = get('https://www.youtube.com/channel/'+user_id)
    # Analyze the obtained html
    soup = BeautifulSoup(html,"html.parser")
    
    # Get the link that has 'thumbnailUrl' as itemprop, this is user's avatar
    avatar_link = soup.find_all('link', {'href': True, 'itemprop': 'thumbnailUrl'})
    
    if len(avatar_link) > 0:
        for item in avatar_link:
            return item['href']
    else:
        consoleMessage_dict = {'Type':'Console','Message':"Could not obtain user avatar"}
        json_dict = json.dumps(consoleMessage_dict)
        print (json_dict, flush=True)

def start_youtube():
    if use_youtube_api_key == '0':
        video_id = get_livestream_id_without_Youtube_API_KEY(channel_id)
        consoleMessage_dict = {'Type':'Console','Message':"0 - video_id: "+str(video_id)}
        json_dict = json.dumps(consoleMessage_dict)
        print (json_dict, flush=True)
    else:
        video_id = get_livestream_id_with_YouTube_API_KEY(channel_id)
        consoleMessage_dict = {'Type':'Console','Message':"1 - video_id: "+str(video_id)}
        json_dict = json.dumps(consoleMessage_dict)
        print (json_dict, flush=True)
        
    consoleMessage_dict = {'Type':'Console','Message':"video_id: "+str(video_id)}
    json_dict = json.dumps(consoleMessage_dict)
    print (json_dict, flush=True)

    chat = pytchat.create(video_id=video_id)
    while True:
        try:
            for c in chat.get().sync_items():
                
                if re.match(r'\[Twitch:(.*?)\]', c.message):
                    continue
                # Create dictionary (object)
                youtube_dict = {'Type':'Message','Logo':get_user_avatar(c.author.channelId),'User': c.author.name,'Message':c.message, 'TTSMessage':  c.author.name+' '+c.message}
                
                # Convert dictionary to Json object
                json_dict = json.dumps(youtube_dict)

                # Print in console and flush to send it to frontend
                print(json_dict, flush=True)
        except:
            youtube_dict = {'Type':'Message','Logo':'','User': 'Error', 'Message':  'Youtube chat stopped working'}
                
            # Convert dictionary to Json object
            json_dict = json.dumps(youtube_dict)

            # Print in console and flush to send it to frontend
            print(json_dict, flush=True)

start_youtube()

# TODO // Send message to YouTube chat 