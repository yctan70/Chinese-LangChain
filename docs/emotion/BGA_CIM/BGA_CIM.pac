Program Main
'	Dim idx as integer
'	Dim rcv_msg as string
'	Dim cmd_buf[5] as string


'	rcv_msg = "*,3A,ROUTE=OK,#+*,3A,11,#+*,3A,ROUTE=OK,#"
'	cmd_buf = split(rcv_msg, "#")

'	for idx =0 to 4
'		print "cmd_buf[", idx, "]=", cmd_buf[idx]
'	next idx

'	rcv_msg = "*,3A,ROUTE=OK,#+*,3A,11,#+"
'	cmd_buf = split(rcv_msg, "#")

'	for idx =0 to 4
'		print "cmd_buf[", idx, "]=", cmd_buf[idx]
'	next idx




'	stop
	
	MainSub()
	print "GoodBye PAC"
End Program