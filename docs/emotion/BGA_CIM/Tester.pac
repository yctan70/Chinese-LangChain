Dim net0 as NetSlave
Dim server_inited as integer

Sub TesterTask
	Dim cmd_idx as integer
	Dim arg_idx as integer
	Dim cmd_buf[5] as string
	Dim proc_str as string
	Dim arg_buf[10] as string
	Dim rcv_msg as string
	Dim idx as integer
	Dim station_no as integer
	Dim is_valid as integer
	Dim station_str as string
	Dim msg_len as integer
	Dim first_char as string
	Dim second_char as string

	if gTesterSimu = 0 then
		'if gSysSimulation = 0 then
			'net0.init(1,"192.168.1.105",2000)
			'net0.init(1,"127.0.0.1",2000)
			if gSysSimulation = 1 then
				net0.init(1,"172.20.10.2",8000)
			else
				net0.init(1, gIP, gPort) '<----- IP and Port
			end if
		'else
		'	net0.init(1,"127.0.0.1",2000)
		'end if

		net0.start()	
	else
		ResetDI VIO_TESTER_SIMU_ACK
	end if

	server_inited = 1

	do
	*StartRecv:
		if gTesterSimu = 0 then
			rcv_msg =  net0.recv()
		else
			G000 = ""
			WAIT VIO_TESTER_SIMU_WAIT, HIGH
			Delay 100
			ReSetDI VIO_TESTER_SIMU_WAIT
			'ReSetDI VIO_TESTER_SIMU_ACK
			Delay 100
			rcv_msg = G000
		end if

		if rcv_msg = "" then

		else		
			print "Msg From Server : ", rcv_msg						
			'rcv_msg = "*,3A,ROUTE=OK,#+*,3A,11,#"
			ReSetDI VIO_TESTER_SIMU_ACK

			cmd_buf = split(rcv_msg, "#")
			for cmd_idx = 0 to 4
				proc_str = cmd_buf[cmd_idx]
			
				msg_len = len(proc_str)
				
				if msg_len > 2 then
					first_char = Mid(proc_str, 1, 1)
					second_char = Mid(proc_str, 2, 1)

					'print "first_char =", first_char
					'print "second_char=", second_char
					if (first_char <> "*") and (second_char = "*") then
						proc_str = Mid(proc_str, 2, msg_len-1)
						print "proc_str head is trimmed"
					end if

					print "RX : ", proc_str

					arg_buf = split(proc_str, ",")
					'for idx = 0 to 9
					'	print "arg_buf[", idx, "]=", arg_buf[idx]
					'next idx

					if (arg_buf[0] <> "*") then
						print "Format error, wrong head"
					'elseif  (arg_buf[6] <> "#") and (arg_buf[3] <> "#") then
					'	print "len(arg_buf[3])=", len(arg_buf[3])
					'	print "Format error, wrong tail"
					else
						' Old Format   :  A,CmdID,EQ,Product,BGA,B
						' Ex                 :  A,01,03,AGERA,U1201,B
						' New Format :  *,Station,CmdID,Product,BGA,Comment,#
						' Ex                 :  *,3A,01,Bentley,BB_RF,Clear pad,#

						'for idx = 0 to 9
						'	print "arg_buf[", idx, "]=", arg_buf[idx]
						'next idx

						'gCimCmd = arg_buf[1]
						'station_no = CInt(arg_buf[2])					
						station_str = arg_buf[1]
						gCimCmd = arg_buf[2]
						print "CIM, Station =", station_str
						print "CIM, Command=", gCimCmd					

						if (gCimCmd = CIM_CMD_PROCESS) or (gCimCmd = CIM_CMD_BYPASS) then 
							gCimProdcut = arg_buf[3]
							gCimRecipe = arg_buf[4]
							gCimComment = arg_buf[5]
							print "CIM, Product     =", gCimProdcut
							print "CIM, Recipe       =", gCimRecipe
							print "CIM, Comment  =", gCimComment
						end if
			
						is_valid = TRUE

						'if gStationNo <> station_no then
						if gStationNoStr <> station_str then
							is_valid = FALSE
							MessagePopup(71)
						end if				

						if (gCimCmd <> CIM_CMD_PROCESS) and (gCimCmd <> CIM_CMD_BYPASS) and (gCimCmd <> CIM_CMD_NOT_AUTO) and (gCimCmd <> CIM_CMD_AUTO_DONE) and (gCimCmd <> CIM_CMD_WRONG_SIDE) then
							is_valid = FALSE
							if gCimCmd <> "ROUTE=OK" then
								MessagePopup(72)
							end if
						end if

						if is_valid = TRUE then							
							if gCimCmd = CIM_CMD_PROCESS then
								is_valid = IsValidRecipe(gCimProdcut, gCimRecipe)
					
								if is_valid = TRUE then
									AckOK("Response")
									gCimCmdErr = CIM_CMD_ERR_NONE

									if (gCimProdcut <> gActiveProduct) then
										' Switch Product
										SwitchProduct(FALSE, gCimProdcut)
									end if
							
									if (gCimRecipe <> gActiveRecipe) then
										SwitchRecipe(FALSE, gCimRecipe)	
									end if

									'print "gPlatformEnum=", gPlatformEnum
									'print "gBCSide=", gBCSide
									'if gPlatformEnum <> gBCSide then
									'	gCimCmdErr = CIM_CMD_ERR_WRONG_SIDE ' Current side do not  match recipe side
									'end if

									ShowProductRecipe(gCimProdcut, gCimRecipe)
								else
									if is_valid = -1 then  ' not valid product
										gCimCmdErr = CIM_CMD_ERR_NOT_VALID_P
									elseif is_valid = -2 then ' not valid recipe
										gCimCmdErr = CIM_CMD_ERR_NOT_VALID_R
									end if
								end if
					
								if gCimIsAlarm = 1 then
									gCimIsAlarm = 0
									WaitPrint(95, 1)
								end if
								SetDI VIO_CIM_CMD_OK
							elseif gCimCmd = CIM_CMD_BYPASS then
								AckOK("Response")
								if gCimIsAlarm = 1 then
									gCimIsAlarm = 0
									WaitPrint(95, 1)
								end if
								SetDI VIO_CIM_CMD_OK
							else
								if gCimCmd = CIM_CMD_NOT_AUTO then
									gCimCmdErr = CIM_CMD_ERR_NOT_AUTO
								elseif gCimCmd = CIM_CMD_AUTO_DONE then
									gCimCmdErr = CIM_CMD_ERR_AUTO_DONE
								elseif gCimCmd = CIM_CMD_WRONG_SIDE then
									gCimCmdErr = CIM_CMD_ERR_WRONG_SIDE
								end if
								'ShortBuzzer(3)
								'MessageDisplay2(70)
								SetDI VIO_CIM_CMD_OK
							end if

							'elseif gCimCmd = CIM_CMD_ALARM then
							'	ShortBuzzer(3)
							'	MessageDisplay2(70)
							'	gCimIsAlarm = 1
							'	WaitPrint(95, 0)
							'	SetDI VIO_CIM_CMD_OK
							'end if
					
						end if
				
						if gTesterSimu = 1 then
							SetDI VIO_TESTER_SIMU_ACK
						end if
					end if	
				end if
			next cmd_idx	
		end if		
		delay 100
	loop
End Sub

Sub AckOK(byval dbgstr as string)
	if server_inited = 1 then		
		SendCmdToTester("*,CR,ROUTE=OK,#")
		'if gTesterSimu = 0 then
		'	net0.send("*,CR,ROUTE=OK,#")	
		'else
			'SetDI VIO_TESTER_SIMU_ACK
		'end if
	end if
	print "ACK OK : ", dbgstr
End Sub

Sub AckBC()
	' Ex : A,03,T1234567890,?,B
	Dim snd_msg as string
	Dim site_str as string

	if server_inited = 1 then		
		'snd_msg = "A," + gStationNoStr + "," + gReadBC + ",?,B"
		if gBCSide = SIDE_T then
			site_str = "TOP"
		else
			site_str = "BOT"
		end if

		snd_msg = "*," + gStationNoStr + ",PCS," + gReadBC + "," + site_str + ",#"

		SendCmdToTester(snd_msg)
		'if gTesterSimu = 0 then			
		'	net0.send(snd_msg)
		'else
		'	SetDI VIO_TESTER_SIMU_ACK
		'	SendSimuAck(snd_msg)
		'end if
	end if
End Sub

Sub RtnResult(byval result as string)
	' Ex : A,03,T1234567890,07,B
	Dim snd_msg as string

	if server_inited = 1 then
		'snd_msg = "A," + gStationNoStr + "," + gReadBC + "," + result + ",B"
		if (result = CIM_RTN_PRE_FAIL) or (result = CIM_RTN_PROC_OK) or (result = CIM_RTN_PROC_NG) then
			snd_msg = "*," + gStationNoStr + "," + result + "," + gReadBC + ",#"
		else
			snd_msg = "*," + gStationNoStr + "," + result + ",#"
		end if

		SendCmdToTester(snd_msg)

		'if gTesterSimu = 0 then
		'	net0.send(snd_msg)
		'else
		'	'SetDI VIO_TESTER_SIMU_ACK
		'	SendSimuAck(snd_msg)
		'end if
	end if
End Sub

Sub SendSimuAck(byval snd_msg as string)
	print "C115,", snd_msg
End Sub

Function GetCimCmdErrHmiMsgId(byval err_id as integer) as integer
	Dim msg_id as integer

	if err_id = CIM_CMD_ERR_NOT_VALID_P then
		msg_id = 66
	elseif err_id = CIM_CMD_ERR_NOT_VALID_R then
		msg_id = 67
	elseif err_id = CIM_CMD_ERR_ALRAM then
		msg_id = 68
	elseif err_id = CIM_CMD_ERR_NOT_AUTO then
		msg_id = 84
	elseif err_id = CIM_CMD_ERR_AUTO_DONE then
		msg_id = 85
	elseif err_id = CIM_CMD_ERR_WRONG_SIDE then
		msg_id = 86
	end if

	return msg_id
End Function

Sub SendCmdToTester(byval snd_msg as string)
	print "Tx : ", snd_msg
	if gTesterSimu = 0 then
		net0.send(snd_msg)
	else
		SetDI VIO_TESTER_SIMU_ACK
		SendSimuAck(snd_msg)
	end if
	Delay 100
End Sub