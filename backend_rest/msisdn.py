def normalizeMsisdn(msisdn):
    if msisdn.startswith('0') or len(msisdn) == 9:
        new_msisdn = f'255{msisdn[-9:]}'
    elif msisdn.startswith("+"):
        new_msisdn = msisdn[1:]
    else:
        new_msisdn = msisdn

    print(f'{new_msisdn} from {msisdn}')


msisdns = ['+255713123066', "1712123066", "+1713123066", "713123066", "0713123066"]
for msisdn in msisdns:
    normalizeMsisdn(msisdn)

'''
==Result==
255713123066 from +255713123066
1712123066 from 1712123066
1713123066 from +1713123066
255713123066 from 713123066
255713123066 from 0713123066
'''
