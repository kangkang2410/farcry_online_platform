from datetime import datetime, timedelta
from re import search
from json import dumps
from hashlib import md5
from requests import post
from sys import argv, stdout
from psutil import NoSuchProcess, AccessDenied, ZombieProcess, process_iter
from time import sleep


class Session():
    def __init__(self, log_data, time_mark, log_start_time, delta_hour):
        self.log_data = log_data
        self.log_start_time = log_start_time
        self.delta_hour = delta_hour
        self.time_mark = time_mark
        self.frags = []
        self.session_start_time = ''
        self.session_end_time = ''
        self.server_name = ''
        self.get_frags()
        self.session_name = self.get_session_name()

    @staticmethod
    def check_if_hour_increase(current_time, flag):
        """
        get current_time and flag as 2 string reference for current line's time
        and the last line's time, compare them if current time is smaller than
        flag that mean the hour increase 1
        :param current_time: list [string, string]
        :param flag: list [string, string]
        :return: Boolean
        """
        try:
            if (int(current_time[0]) * 60 + int(current_time[1])) <= (int(flag[0]) * 60 + int(flag[1])):
                return False
        except:
            return False
        return True

    def convert_to_datetime(self, current_minute, current_second, delta_hour):
        """
        get current as a string("<nn:nn>"), return a datetime object base on
        delta hour and delta day.
        :param current_time: string
        :param delta_hour: int
        :return: datetime object
        """
        return self.log_start_time.replace(minute=int(current_minute),
                                       second=int(current_second)) + \
                                       timedelta(hours=delta_hour)

    def get_frags(self):
        """
        get data from log file and return a list of kill information. Kill
        information is a tuple contain time, killer, weapon and victim. If
        there some suicides, the kill information only contain time and his
        name
        :return: list
        """
        def handle_frag_type_line(regex_search_result):
            """
            return tuple of frag: minute, second, killer, weapon, victim
            """
            frag = regex_search_result.groups()
            frag = frag[0:5] if frag[0] else frag[5:]
            frag_info = [self.convert_to_datetime(frag[0], frag[1], self.delta_hour).strftime('%Y-%m-%d %H:%M:%S')] + list(frag[2:])
            return frag_info

        def handle_session_time_type_line(regex_search_result, type):
            session_time = regex_search_result.groups()[0:2]
            return self.convert_to_datetime(session_time[0], session_time[1], self.delta_hour)

        for line in self.log_data:
            pattern = search('<([0-5][0-9]):([0-5][0-9])>.*', line)
            frag = search('<([0-5][0-9]):([0-5][0-9])> <Lua> ([^ ]*) killed ([^ ]*) with ([^ \n]*)|<([0-5][0-9]):([0-5][0-9])> <Lua> ([^ ]*) killed itself', line)
            start_time = search('<([0-9][0-9]):([0-9][0-9])>  Level [^ ]* loaded in .* seconds', line)
            end_time = search('<([0-5][0-9]):([0-5][0-9])> == Statistics * ==', line)
            server_name = search('<([0-5][0-9]):([0-5][0-9])> Servername: (.*)', line)
            if pattern:
                if self.check_if_hour_increase(self.time_mark, pattern.groups()[0:2]):
                    self.delta_hour += 1
                    self.time_mark = pattern.groups()[0:2]
                else:
                    self.time_mark = pattern.groups()[0:2]
                if frag:
                    self.frags.append(handle_frag_type_line(frag))
                elif start_time:
                    self.session_start_time = handle_session_time_type_line(start_time, self.delta_hour)
                elif end_time:
                    self.session_end_time = handle_session_time_type_line(end_time, self.delta_hour)
                elif server_name:
                    self.server_name = server_name.groups()[2]

    def get_session_name(self):
        """
        retun session name as a combination of session start time and its server name
        """
        try:
            return self.session_start_time.strftime('%Y-%m-%d %H:%M:%S') + '|' + self.server_name
        except:
            return self.session_start_time.strftime('%Y-%m-%d %H:%M:%S')


class LogController:
    def __init__(self, log_file_path, token, player_name):
        self.log_file_path = log_file_path
        self.log_data = self.get_log_data()
        self.start_time = self.parse_log_start_time()
        self.log_data_group_list = self.split_log_data()
        self.session_list = self.create_session_list()
        self.token = token
        self.player_name = player_name

    def get_log_data(self):
        """
        read the log file and return each line as an element in log_data
        if it get error continue to read until it can
        """
        while True:
            try:
                with open(self.log_file_path) as file:
                    return [line for line in file.read().split('\n') if line]
            except Exception:
                sleep(1)

    def parse_log_start_time(self):
        """
        get a date_time object by read the first line of the log_file
        :return: date_time object
        """
        def get_time_zone():
            """
            """
            for line in self.log_data:
                re_result = search('<[0-5][0-9]:[0-5][]0-9]> Lua cvar: \(g_timezone,([^ ]*)\)', line)
                try:
                    return re_result.groups()[0]
                except AttributeError:
                    pass
            return '-5'

        start_time_info = self.log_data[0][2:]
        time_zone = get_time_zone()
        if len(time_zone) == 2:
            time_zone = time_zone[0] + '0' + time_zone[1] + '00'
        else:
            time_zone = '+' + '0' + time_zone + '00'
        start_time_info += time_zone
        for index, charactor in enumerate(start_time_info):
            if charactor == ',':
                return datetime.strptime(start_time_info[index + 2:],
                                        '%B %d, %Y %H:%M:%S%z')

    def split_log_data(self):
        """
        cut the log data into parts base on the real log
        """
        log_data_group_list = []
        index_list = []
        for index, line in enumerate(self.log_data):
            if search('<[0-9][0-9]:[0-9][0-9]>  Level [^ ]* loaded in .* seconds', line):
                #Find the start line
                if not len(index_list):
                    index_list.append(index)
            elif search('<([0-5][0-9]):([0-5][0-9])> == Statistics * ==', line):
                #Find the end line
                index_list.append(index + 3) # +3 mean to get the 3rd line after the end line that contain the server_name
            if len(index_list) == 2:
                log_data_group_list.append(index_list)
                index_list = []
        return log_data_group_list

    def create_session_list(self):
        """
        create session object base on data from log group.
        return: list
        """
        log_list = []
        delta_hour = 0
        time_mark = [self.start_time.hour, self.start_time.second]
        for group in self.log_data_group_list:
            try:
                session = Session(self.log_data[group[0]:group[1]], time_mark, self.start_time, delta_hour)
                #time_mark is when the last action of previous session occure
                time_mark = session.session_end_time.minute, session.session_end_time.second
                delta_hour = session.delta_hour
                log_list.append(session)
            except Exception:
                pass
        return log_list

    @staticmethod
    def check_if_farcry_running(game_name='farcry'):
        """
        Check if there is any running process that contains the given name processName.
        """
        for process in process_iter():
            try:
                if game_name.lower() in process.name().lower():
                    return True
            except (NoSuchProcess, AccessDenied, ZombieProcess):
                pass
        return False

    def submit_data(self):
        """
        submit all accepted session that the log contains to farcry server
        """
        def submit(session, token, player_name):
            """
            get token, player_name to submit data to server
            :token: (string)
            :player_name: (string)
            """
            url = "https://farcryserver.herokuapp.com/farcryAPI/v1/matches/submit/"
            headers = {"Authorization":token}
            params = {
                "player_name":player_name,
            }
            data = {"match_name":session.session_name,
                    "match_start_time":session.session_start_time.strftime('%Y-%m-%d %H:%M:%S'),
                    "match_end_time":session.session_end_time.strftime('%Y-%m-%d %H:%M:%S'),
                    "match_frags":str(session.frags)}
            response = post(url, params=params, json=data, headers=headers)
            print(response.status_code)
            return response.status_code, response.json()

        for session in self.session_list:
            submit(session, self.token, self.player_name)


if __name__ == "__main__":
     while True:
        try:
            if not LogController.check_if_farcry_running(game_name=argv[4]):
                LogController(log_file_path=argv[1],
                            token=argv[2],
                            player_name=argv[3]).submit_data()
                sleep(2)
        except:
            pass
