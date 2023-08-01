Dim net1 as NetSlave
Dim ccd_inited as integer
Dim gVisionFailed as integer
'=============================
Sub VisionTask
	Dim idx as integer
	Dim send_msg as string
	Dim rcv_msg as string
	Dim cmd_len as integer
	Dim sub_str as string
	Dim BC_buf as string

	Dim cmd_idx as integer
	Dim ccd_id as integer
	Dim cmd_buf[10] as string

	Dim arg_idx as integer
	Dim arg_buf[10] as string
	Dim abs_value[2] as double

	if gVisionSimu = 1 then
		net1.init(2, "127.0.0.1", 6260)
	else
		net1.init(2, "192.168.1.106", 6260)
	end if

	net1.start()

	ccd_inited = 1
	
	do
		rcv_msg =  net1.recv()
		
		if rcv_msg = "" then

		else
			print "receive from Vision:", rcv_msg

			cmd_buf = split(rcv_msg, "#")		
		
			for  cmd_idx = 0 to 9		
		
				'print "Cmd(2):", cmd_buf[cmd_idx]
							
				if cmd_buf[cmd_idx] = "" then
					break
				end if
		
				arg_buf = split(cmd_buf[cmd_idx], ",")
			
				'== Format : T1,Camera,CmdID,Arg0,Arg1,...,ArgN,# ==
				if arg_buf[0] = "T1" then	
				
					ccd_id = CInt(arg_buf[1])-1		
					
					if arg_buf[2] = "INDEX" then
						if (arg_buf[3] = "") or (arg_buf[4]="") then 
							print "INDEX args error"
						else
							gVisionAckData[0] = Cdbl(arg_buf[3])
							gVisionAckData[1] = Cdbl(arg_buf[4])
							print "INDEX, Vision Data[0]=", gVisionAckData[0]
							print "INDEX, Vision Data[1]=", gVisionAckData[1]							
							SetDI VIO_VISION_INDEX_ACK
						end if					
					elseif arg_buf[2] = "SCALE" then ' SCALE Calibration process is done					
						if (arg_buf[3] = "") or (arg_buf[4]="") then 
							print "SCALE args error"
						else
							gVisionAckData[0] = Cdbl(arg_buf[3])
							gVisionAckData[1] = Cdbl(arg_buf[4])
							print "SCALE, Vision Data[0]=", gVisionAckData[0]
							print "SCALE, Vision Data[1]=", gVisionAckData[1]
						
							abs_value[0] = Abs(gVisionAckData[0])
							abs_value[1] = Abs(gVisionAckData[1])
							print "ccd_id=", ccd_id
							
							if ccd_id = 0 then
								if (abs_value[0] > VISION_MAX_SCALE) or (abs_value[1] > VISION_MAX_SCALE) then
									SetFatalErrBreak2("SCALE, Vision Data out of range")
								else
									SetDI VIO_VISION_SCALE_ACK
								end if	
							elseif ccd_id = 1 then
								SetDI VIO_VISION_SCALE_ACK	
							end if					
						end if										
					elseif arg_buf[2] = "DELTA" then
						if (arg_buf[3] = "") or (arg_buf[4]="") then
							SetFatalErrBreak2("DELTA args error")
						else
							gVisionAckData[0] = Cdbl(arg_buf[3])
							gVisionAckData[1] = Cdbl(arg_buf[4])
							
							abs_value[0] = Abs(gVisionAckData[0])
							abs_value[1] = Abs(gVisionAckData[1])
							
							print "DELTA, Vision Data[0]=", gVisionAckData[0]
							print "DELTA, Vision Data[1]=", gVisionAckData[1]
							
							if ccd_id = 0 then 
								if (abs_value[0] > VISION_MAX_DELTA) or (abs_value[1] > VISION_MAX_DELTA) then
									gVisionFailed = 1	
								end if
							end if
							SetDI VIO_VISION_DELTA_ACK																															
						end if
'					elseif arg_buf[2] = "SN" then
'						gReadSN = arg_buf[3]	
'						print "Vision returned SN=", gReadSN
'						CheckProductSN(gReadSN)
'						'==============================												
'						SetDI VIO_VISION_SN_ACK
					elseif arg_buf[2] = "FAIL" then
						'if gReadingSN = 1 then
						'	gReadSN = "FAIL"
						'	SetDI VIO_VISION_SN_ACK
						'else
						if gReadingSN = 0 then
							gVisionFailed = 1
							SetDI VIO_VISION_DELTA_ACK
						end if
					elseif arg_buf[2] = "IQC" then
						gReadIQC = arg_buf[3]
						SetDI VIO_VISION_IQC_ACK
					end if
				end if
			next cmd_idx   		
		end if		
		delay 100
	loop
End sub

Sub SendScaleToVision(byval arm_id as integer)
	Dim snd_str as string
	Dim snd_id as integer
	snd_id = arm_id+1
	snd_str = "T1," + CStr(snd_id) + ",SCALE,T,#"
	SendCmdToVision(snd_str )
End Sub

Sub SendDeltaToVision(byval arm_id as integer, byval tp_name as string)
	Dim snd_str as string
	Dim snd_id as integer
	snd_id = arm_id+1	
	
	if ccd_inited then
		snd_str = "T1,"+CStr(snd_id)+",DELTA,"+tp_name
		
		'if gPlatformAngle = 0 then
			snd_str = snd_str + ",00,#"		
		'else
		'	snd_str = snd_str + ",90,#"			
		'end if
		
		SendCmdToVision(snd_str)
	end if
End Sub

Sub SendIQCToVision(byval arm_id as integer)
	Dim snd_str as string
	Dim snd_id as integer
	
	snd_id = arm_id+1
	snd_str = "T1," + CStr(snd_id) + ",IQC," + gActiveProduct + "," + gRecipeBGA + ",#"
	SendCmdToVision(snd_str )
End Sub

Sub SendCmdToVision(byval snd_msg as string)
	if ccd_inited = 1 then
		net1.send(snd_msg)
		print "send2VisionCmd:" , snd_msg
	end if
End Sub

Sub GetSerialNumber()
	Dim failed_cnt as integer
*ReSN:
	ResetVioAndWait(VIO_VISION_SN_ACK)
	'SendCmdToVision("T1,1,SN,CodeRead,#")	
	SendCmdToVision("T1,1,SN,CodeRead,#")
	WAIT VIO_VISION_SN_ACK, HIGH
	'gReadSN = "C072426EUJ4F64RA" ' For tmp demo
	if (gReadSN = "") or (gReadSN = "FAIL") then
		failed_cnt = failed_cnt + 1
'		if failed_cnt > 3 then
'		if failed_cnt > 0 then
		if failed_cnt > 1 then
			'SetFatalErrBreak("Failed to read SN")
			print "Failed to read SN"
			gReadSN = "FAIL"
			ShortBuzzer(3)
		else	
			print "Retry to read SN"
			'MoveArmIndex(ARM_1, 0, 5, 0, 0, 20)
			Delay 500
			goto *ReSN
		end if
	end if
End Sub

Sub GetDeltaData(byval ccd_id as integer, byval mark_name as string)
        Dim current_pos as position
        Dim failed_cnt as integer
        Dim mark_idx as integer
	Dim result as integer

	failed_cnt  = 0
	
	if mark_name = gMarkName[gPlatformSide, 0] then
		mark_idx = 0
	elseif mark_name = gMarkName[gPlatformSide, 1] then
		mark_idx = 1
	else
		print "Invalid Case"
	end if	
	
*ReDelta:
	gVisionFailed = 0
	ResetDI VIO_VISION_DELTA_ACK
	WAIT VIO_VISION_DELTA_ACK, LOW
		
	Delay BF_MARK_DELAY
	
	if GetDI(VIO_PAUSE_BF_DELTA) = 1 then
		MessagePopup(34)
	end if
	
	WaitPrint(94, 0)
	SendDeltaToVision(ccd_id, mark_name)

	WAIT VIO_VISION_DELTA_ACK, HIGH
	WaitPrint(94, 1)
	
	if GetDI(VIO_PAUSE_AF_DELTA) = 1 then
		MessagePopup(34)
	end if	
	
	if gVisionFailed = 1 then
		failed_cnt = failed_cnt + 1
		if failed_cnt <= 3 then
			goto *ReDelta	
		end if
	end if
	
	if gVisionFailed = 1 then
		failed_cnt = 0
		AlignmentErrProcPopup(result)
		if result = ALIGN_ERR_RETRY then
			goto *ReDelta
		end if
	else
		if ccd_id = CCD_0 then
			TakeArm ARM_0
				current_pos = CurPos(ARM_0)
			GiveArm ARM_0
						
			gArmPointX[mark_idx] = PosX(current_pos) - gVisionAckData[0] + TIP_CCD_X
			gArmPointY[mark_idx] = PosY(current_pos) - gVisionAckData[1] + TIP_CCD_Y			
		end if
	end if
End Sub

Sub GetIQCData()
 	Dim failed_cnt as integer
	Dim snd_msg as string

	Delay BF_MARK_DELAY
*ReIQC:
	ResetVioAndWait(VIO_VISION_IQC_ACK)
	WaitPrint(93, 0)
	snd_msg = "T1,1,IQC," + gRecipeBGA + "," + CStr(gRecipeIQC) + ",#" ' 1 for regular BGA, 2 for shield
	SendCmdToVision(snd_msg)
	WAIT VIO_VISION_IQC_ACK, HIGH
	WaitPrint(93, 1)

	if (gReadIQC = "") or (gReadIQC = "NG") then
		failed_cnt = failed_cnt + 1
'		if failed_cnt > 3 then
'		if failed_cnt > 0 then
		if failed_cnt > 1 then
			print "IQC NG"
			gReadIQC = "NG"
			ShortBuzzer(3)
		else	
			print "Retry to read IQC"
			'MoveArmIndex(ARM_1, 0, 5, 0, 0, 20)
			Delay 500
			goto *ReIQC
		end if
	end if
End Sub

Sub CCDTask(byval adj as integer)
	Dim cur_pos as position
	Dim diff as double
	Dim result as integer
	
	gVisionFailed = 0
	
	if gVisionFailed = 0 then					
		SetDO DO_CCD_LIGHT
	
		MoveCCDToMark(0, MOVE_X_Y_Z)
		Delay 1000

		GetDeltaData(CCD_0, gMarkName[gPlatformSide, 0])

		if gVisionFailed = 0 then
			MoveCCDToMark(1, MOVE_X_Y_Z)
			GetDeltaData(CCD_0, gMarkName[gPlatformSide, 1])
		end if
	
		ResetDO DO_CCD_LIGHT
	
		if gVisionFailed = 0 then
			TwoPointTeach()
		end if			
	end if				
End Sub

Sub KillCCDTask()
	Dim task_status as  integer
	task_status = GetTask CCDTask
	if task_status <> -1 then						
		KillTask CCDTask
	end if
End Sub
