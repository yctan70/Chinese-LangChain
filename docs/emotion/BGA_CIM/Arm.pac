Sub VisionMarkTest()
	Dim result as integer
	Dim side as integer
	Dim mark_idx as integer
	Dim vision_enable as integer
	Dim num_of_index_move as integer
	Dim ccd_index as integer
	Dim pos1 as position
	Dim pos2 as position
	Dim db_file as FileSystem
	Dim x_diff as double
	Dim y_diff as double
	
	RetractArm()

	ResetDO DO_CCD_LIGHT
	
	ConfirmPopup(74, result)
	
	if result = 0 then
		stop
	end if
		
	side = G009
	print "G009=", G009
	mark_idx = G012
	print "G012=", G012
	if side = SIDE_T then
		AssignPlatformEnum(T_000)
	else
		AssignPlatformEnum(B_000)
	end if

	if gMarkName[side, mark_idx] = "" then
		MessagePopup(75)
		stop
	end if

	vision_enable = G013
	if vision_enable = 1 then
		RunTask VisionTask
	end if
	
	MoveCCDToMark(mark_idx, MOVE_X_Y_Z)
	SetDO DO_CCD_LIGHT
	
	TakeArm ARM_0
		pos1 = CurPos(ARM_0)
	GiveArm ARM_0
	
	ShowAutoCaliFailWnd(ARM_0, 0, 1, -1)
	
	num_of_index_move = 0
	if vision_enable = 1 then
		while TRUE
			GetDeltaData(CCD_0, gMarkName[side, mark_idx])
			if G022 = 0 then			
				if (num_of_index_move  < 3) and (gVisionFailed = 0) then
					num_of_index_move = num_of_index_move + 1
					gVisionAckData[0] = gVisionAckData[0] * (-1)
					gVisionAckData[1] = gVisionAckData[1] * (-1)
					MoveArmIndex(gVisionAckData[0], gVisionAckData[1], 0, 0, 20)					
				else
					break
				end if
			else
				break
			end if
		wend
		if gVisionFailed = 0 then
			TakeArm ARM_0
				pos2 = CurPos(ARM_0)
			GiveArm ARM_0
			x_diff = PosX(pos2) - PosX(pos1)
			y_diff = PosY(pos2) - PosY(pos1)
			LetX ORG_POSITION = PosX(ORG_POSITION) + x_diff
			LetY ORG_POSITION = PosY(ORG_POSITION) + y_diff
			RefreshHmiOrgPos()
		end if 
	end if			
	
	MessagePopup(25)
		
	ResetDO DO_CCD_LIGHT
	ResetDO DO_CCD_LIGHT_2
		
	RetractArm()

	if (vision_enable = 1) then
		KillTask VisionTask
	end if	
	print "VisionMarkTest ended"	
End Sub

Sub VisionScaleTest()
	Dim result as integer
	Dim ccd_index as integer
	
	RetractArm()

	ResetDO DO_CCD_LIGHT
	
	ConfirmPopup(26, result)
	ccd_index = G020
	print "do ccd scale, ccd ", ccd_index
	
	if result = 0 then	
		stop
	end if

	if gMarkName[SIDE_T, 0] = "" then
		MessagePopup(76)
		stop
	end if
		
	RunTask VisionTask
	
	if ccd_index = 0 then
		AssignPlatformEnum(T_000)
		MoveCCDToMark(0, MOVE_X_Y_Z)
		SetDO DO_CCD_LIGHT
	else
		MoveArmToPoint(ARM_0, Z_CALIBRATION_POS_ID)
		SetDO DO_CCD_LIGHT_2
	end if
		
	ShowAutoCaliFailWnd(ARM_0, 0, 1, -1)
	
	SendScaleToVision(ccd_index)	
	ResetDI VIO_VISION_INDEX_ACK	
	WAIT VIO_VISION_INDEX_ACK, LOW	
	WAIT VIO_VISION_INDEX_ACK, HIGH
	ResetDI VIO_VISION_INDEX_ACK			
	if ccd_index = 0 then
		MoveArmIndex(gVisionAckData[0], gVisionAckData[1], 0, 0, 20)
	else
		MoveArmIndex(0, gVisionAckData[0], gVisionAckData[1], 0, 20)
	end if 	
	Delay 1000 ' Do not remove me
	SendScaleToVision(ccd_index)
	ResetDI VIO_VISION_SCALE_ACK
	WAIT VIO_VISION_SCALE_ACK, LOW
	WAIT VIO_VISION_SCALE_ACK, HIGH
	ResetDI VIO_VISION_SCALE_ACK			
	
	MessagePopup(25)
		
	ResetDO DO_CCD_LIGHT
	ResetDO DO_CCD_LIGHT_2
		
	RetractArm()

	KillTask VisionTask

	print "VisionScaleTest ended"
End Sub
' ============
Sub AssignPlatformEnum(byval enum as integer)
	gPlatformEnum = enum
	
	if gPlatformEnum = T_000 then
		gPlatformSide = SIDE_T
		ORG_POSITION = P[T_000, ARM_0]
		if gZCalibration = 1 then
			LetZ ORG_POSITION = Z_CALIB_H + Z_DIFF_T
		end if
	elseif gPlatformEnum = B_000 then
		gPlatformSide = SIDE_B
		ORG_POSITION = P[B_000, ARM_0]
		if gZCalibration = 1 then
			LetZ ORG_POSITION = Z_CALIB_H + Z_DIFF_B
		end if
	end if	
	print "ORG_POSITION=", ORG_POSITION
End Sub
' ============
Sub PrintPlatformState()
	if gPlatformEnum = T_000 then
		print "PlatformEnum = T_000"
	elseif gPlatformEnum = B_000 then
		print "PlatformEnum = B_000"
	end if
End Sub
' ============
Sub RefreshHmiPointPos(byval arm_id as integer, byval pt_id as integer)
	dim msg as string
	dim pos_x as double
	dim pos_y as double
	dim pos_z as double
	
	pos_x = PosX(P[pt_id, ARM_0])
	pos_y = PosY(P[pt_id, ARM_0])
	pos_z = PosZ(P[pt_id, ARM_0])
	
	msg = "C102," + CStr(arm_id) + "," + 	CStr(pt_id) + "," + CStr(pos_x) + "," + CStr(pos_y) + "," + CStr(pos_z)
	print msg
End Sub
' ============
Sub RefreshHmiOrgPos()
	Dim msg as string
	Dim pos_x as double
	Dim pos_y as double
	Dim pos_z as double
	Dim ini_str as string
	Dim ini_file as FileSystem

	pos_x = PosX(ORG_POSITION)
	pos_y = PosY(ORG_POSITION)
	pos_z = PosZ(ORG_POSITION)

	ini_file.open(PRODUCT_INI)
	ini_str = str(pos_x) + "," + str(pos_y) + "," + str(pos_z)
	
	ini_file.set_ini(gActiveProduct, ORG_TAG[gPlatformEnum], ini_str)
	ini_file.close()
	
	msg = "C124," + gActiveProduct + "," + CStr(gPlatformEnum) + "," + CStr(pos_x) + "," + CStr(pos_y) + "," + CStr(pos_z)
	print msg
End Sub
' ============
Sub RetractArm()
	Dim target_pos as position
	TakeArm ARM_0
		target_pos = CurPos(ARM_0)
		LetZ target_pos =  PosZ(SAFE_POSITION) 
		Move P,@E,target_pos,S=100
		Move P,@E,SAFE_POSITION,S=100	
	GiveArm ARM_0	
End Sub
' ============
Sub RetractZ()
	Dim target_pos as position
	TakeArm ARM_0
		target_pos = CurPos(ARM_0)
		LetZ target_pos =  PosZ(SAFE_POSITION)
		Move P,@E,target_pos,S=100
	GiveArm ARM_0		
End Sub
' ============
'Sub ArmMoveToPCB(byval arm_id as integer, byval pt_idx as integer)
		
'	Dim target_pos as position
	
'	TakeArm arm_id
				
'	if arm_id =0 then		
'		LetY target_pos =  PosY(ORG_POSITION) - gPcbPointX[pt_idx]
'		LetX target_pos =  PosX(ORG_POSITION) - gPcbPointY[pt_idx]
'	else
'		LetY target_pos =  PosY(ORG_POSITION) + gPcbPointX[pt_idx]
'		LetX target_pos =  PosX(ORG_POSITION) + gPcbPointY[pt_idx]
'	end if
		
'	LetZ target_pos =  PosZ(ORG_POSITION) ' Move to contact position with slow speed
	
'	GiveArm arm_id
	
'	ArmMoveToPos(arm_id, target_pos, 0, 0)
'End Sub
' ============
'Sub ArmMoveToComp(byval arm_id as integer, byval comp as string, byval pin as integer, byval depth as double)
'	Dim db_file as FileSystem
'	Dim target_pos as position
'	Dim x_sym as double
'	Dim y_sym as double
'	Dim z_sym as double
'	Dim side_sym as string
'	Dim mask_sym as integer
'	Dim x_oft as double
'	Dim y_oft as double
'	Dim rtn as integer
	
'	TakeArm arm_id
	
'	GetPCBXYZ(comp, pin, x_sym, y_sym, z_sym, side_sym, mask_sym, rtn)	
	
'	GetPreciseOffset(arm_id, x_sym, y_sym, x_oft, y_oft)
		
'	if (x_sym = 0) and (y_sym = 0) and  (z_sym = 0) then
'		print "invalid component"
'		stop		
'	else								
'		LetX target_pos =  PosX(ORG_POSITION) + x_oft 
'		LetY target_pos =  PosY(ORG_POSITION) + y_oft 		
'		LetZ target_pos =  PosZ(ORG_POSITION)  - depth '- z_sym - depth
'	end if		
'	GiveArm arm_id
'	ArmMoveToPos(arm_id, target_pos, 0, 0)
'End Sub
' ============
Sub MoveCCDToMark(byval mark_idx as integer, byval opt as integer)	
	'MoveCCDToComp(arm_id, gMarkName[mark_idx], opt)
	Dim target_pos as position
	Dim x_sym as double
	Dim y_sym as double
	Dim x_offset as double
	Dim y_offset as double	
	Dim extra_offset as double

	x_sym = gMarkX[gPlatformSide, mark_idx]
	y_sym = gMarkY[gPlatformSide, mark_idx]

	if gPlatformEnum = T_000 then
		x_offset = (-1.0) * y_sym
		y_offset = x_sym
	elseif gPlatformEnum = B_000 then
		x_offset = (-1.0) * y_sym 
		y_offset = (-1.0) * x_sym
	else
		print "ERROR, Wrong platform"
	end if
		
	target_pos = ORG_POSITION
	print "MoveArmToCCD, ORG_POSITION=",  target_pos
	print "MoveArmToCCD, x_offset=", x_offset
	print "MoveArmToCCD, y_offse=", y_offset
	print "MoveArmToCCD, TIP_CCD_X=", TIP_CCD_X
	print "MoveArmToCCD, TIP_CCD_Y=", TIP_CCD_Y

	extra_offset = 0.0

	LetX target_pos =  PosX(ORG_POSITION) + x_offset - TIP_CCD_X + extra_offset
	LetY target_pos =  PosY(ORG_POSITION) + y_offset - TIP_CCD_Y + extra_offset	
	LetZ target_pos =  CCD_Z[gPlatformSide]
	
	print "MoveArmToCCD, target_pos=", target_pos
		
	ArmMoveToPos(target_pos, 1, opt)
End Sub
' ============
Sub MoveCCDToComp(byval arm_id as integer, byval comp_name as string, byval opt as integer)
	Dim target_pos as position
	Dim x_sym as double
	Dim y_sym as double
	Dim z_sym as double
	Dim x_offset as double
	Dim y_offset as double	
	Dim side_sym as string
	Dim mask_sym as integer
	Dim rtn as integer
	'Dim ccd_z_pos as double
	Dim extra_offset as double
		
	GetPCBXYZ(comp_name, 1, x_sym, y_sym, z_sym, side_sym, mask_sym, rtn)
	
'	if gSysCalibration = 1 then
'		gArmXCCDTmp = x_sym
'		gArmYCCDTmp = y_sym
'	end if
	
	if gPlatformEnum = T_000 then
		x_offset = (-1.0) * y_sym
		y_offset = x_sym
	elseif gPlatformEnum = B_000 then
		x_offset = (-1.0) * y_sym 
		y_offset = (-1.0) * x_sym
	else
		print "ERROR, Wrong platform"
	end if
		
	target_pos = ORG_POSITION
	print "MoveArmToCCD, ORG_POSITION=",  target_pos
	print "MoveArmToCCD, x_offset=", x_offset
	print "MoveArmToCCD, y_offse=", y_offset
	print "MoveArmToCCD, TIP_CCD_X=", TIP_CCD_X
	print "MoveArmToCCD, TIP_CCD_Y=", TIP_CCD_Y

	extra_offset = 0.0

	LetX target_pos =  PosX(ORG_POSITION) + x_offset - TIP_CCD_X + extra_offset
	LetY target_pos =  PosY(ORG_POSITION) + y_offset - TIP_CCD_Y + extra_offset
	
	'if gPlatformSide = "A" then
		'ccd_z_pos = CCD_Z
	'else
	'	ccd_z_pos = CCD_Z_OPPO	
	'end if
	
	LetZ target_pos =  CCD_Z[gPlatformSide]
	
	print "MoveArmToCCD, target_pos=", target_pos
		
	ArmMoveToPos(target_pos, 1, opt)
End Sub
' ============
Sub MoveArmIndex(byval x_index as double, byval y_index as double, byval z_index as double, byval z_goback as integer, byval spd as integer)
	Dim target_pos as position
	TakeArm ARM_0		
		print "MoveArmIndex,", x_index, ",", y_index, ",", z_index
		
		target_pos = CurPos(ARM_0)
				
		LetZ target_pos = PosZ(target_pos) + z_index
		Move P,@E,target_pos,S=spd
		delay 100
		
		LetX target_pos = PosX(target_pos) + x_index
		LetY target_pos = PosY(target_pos) + y_index				
		Move P,@E,target_pos,S=spd
				
		if z_goback then
			delay 100
			LetZ target_pos = PosZ(target_pos) - z_index
			Move P,@E,target_pos,S=spd
		end if
	GiveArm ARM_0
End Sub
' ============
Sub MoveArmToPoint(byval arm_id as integer, byval pt_idx as integer)
	ArmMoveToPos(P[pt_idx, arm_id], 0, 0)
End Sub
'============
Sub MoveCCDToPoint(byval arm_id as integer, byval pt_idx as integer)
	Dim target_pos as position
	
	target_pos = P[pt_idx, arm_id]
	LetX target_pos =  PosX(target_pos) - TIP_CCD_X
	LetY target_pos =  PosY(target_pos) - TIP_CCD_Y
	LetZ target_pos =  CCD_Z_CALI
	
	ArmMoveToPos(target_pos, 1, MOVE_X_Y_Z)
End Sub
'============
Sub MoveCCDToCurPos(byval arm_id as integer, byval z_h as double)
	Dim target_pos as position
	TakeArm arm_id
		target_pos = CurPos(arm_id)
		LetZ target_pos =  z_h
		Move P,@E, target_pos, S=100
	GiveArm
	LetX target_pos =  PosX(target_pos) - TIP_CCD_X
	LetY target_pos =  PosY(target_pos) - TIP_CCD_Y
	LetZ target_pos =  z_h
	
	ArmMoveToPos(target_pos, 1, MOVE_X_Y_Z)
End Sub
'============
'Sub MoveArmToPointDirectly(byval arm_id as integer, byval pt_idx as integer)
'	ArmMoveToPos(arm_id, P[pt_idx, arm_id], 1)
'End Sub
' ============
Sub ArmMoveToPos(byval cmd_pos as position, byval direct as integer, byval opt as integer)
	Dim current_pos as position
	Dim target_pos as position
	Dim current_h as double
	Dim target_h as double		
	Dim THRESHOLD_H as double
	Dim spd as integer
	Dim new_target_h as double
	
	spd= 80
	
	THRESHOLD_H = 10
	
	TakeArm ARM_0
	'current_pos = cmd_pos
	current_pos = CurPos(ARM_0)
	current_h = PosZ(current_pos)
	target_h = PosZ(cmd_pos)
	target_pos = current_pos
		
	if direct = 1 then	
		if current_h < target_h then
			LetZ target_pos =  target_h
			Move P,@E,target_pos,S=spd
		end if
	else
		if current_h < (target_h + THRESHOLD_H) then
			new_target_h = target_h + 20'THRESHOLD_H
			if new_target_h >= Z_POS_LIMIT then
				new_target_h = Z_POS_LIMIT - 1
			end if

			LetZ target_pos =  new_target_h
			Move P,@E,target_pos,S=spd			
		end if
	end if
	'----------------------------------------------
	if direct = 1 then
		if opt = MOVE_Y_THEN_X_Z then
			LetY target_pos =  PosY(cmd_pos) ' Move Y first
			Move P,@E,target_pos,S=spd
		end if
	else
		LetX target_pos =  PosX(cmd_pos) ' Move X first	
		Move P,@E,target_pos,S=spd
		LetY target_pos =  PosY(cmd_pos)	
		Move P,@E,target_pos,S=spd 					
	end if
	
	'----------------------------------------------			
	if direct = 1 then
		Move P,@E,cmd_pos,S=spd
	else	
		new_target_h = PosZ(cmd_pos) + 1
		if new_target_h >= Z_POS_LIMIT then
			new_target_h = Z_POS_LIMIT - 1
		end if
		LetZ target_pos =  new_target_h
		'LetZ target_pos =  PosZ(cmd_pos) + 1		
		Move P,@E,target_pos,S=spd
	
		' Move to pre-calibration contact position	
		LetZ target_pos =  PosZ(cmd_pos) ' Move to contact position with slow speed		
		Move P,@E,target_pos,S=2
	end if
											
	GiveArm ARM_0
	
End Sub

Sub ShowAutoCaliFailWnd(byval arm_id as integer, byval z_sync as integer, byval z_enable as integer, byval msg_idx as integer)
	Dim send_cmd as string
	Dim move_dist as double
	Dim retry as integer
	Dim z_sync_index as double
	
	ResetVioAndWait(VIO_AUTO_CALI_RESPONSE)
	ResetVioAndWait(VIO_AUTO_CALI_RETRY)
	G001 = 0
	
	send_cmd = "C101," + CStr(VIO_AUTO_CALI_RESPONSE) + "," + CStr(VIO_AUTO_CALI_RETRY) + "," + CStr(arm_id) + "," + CStr(msg_idx)
	
	SendCmdToHmi(send_cmd)
	
	if z_sync = 1 then
		z_sync_index = 1
	else
		z_sync_index = 0
	end if
	
	retry = 0
	while(retry = 0)
		WAIT VIO_AUTO_CALI_RESPONSE, HIGH ' It should popup a message to tell user there is no signal
		ResetVioAndWait(VIO_AUTO_CALI_RESPONSE)				
		ResetVioAndWait(VIO_HMI_ENABLE_ACK)
		' user's decision
		if GetDI(VIO_AUTO_CALI_RETRY) = 1 then
			retry = 1
		elseif G001 = 1 then ' x+
			move_dist = G003
			MoveArmIndex(move_dist, 0, z_sync_index, z_sync, 20)
		elseif G001 = 2 then ' x-
			move_dist = (-1) * G003
			MoveArmIndex(move_dist, 0, z_sync_index, z_sync, 20)
		elseif G001 = 3 then ' y+
			move_dist = G003
			MoveArmIndex(0, move_dist , z_sync_index, z_sync, 20)
		elseif G001 = 4 then ' y-
			move_dist = (-1) * G003
			MoveArmIndex(0, move_dist , z_sync_index, z_sync, 20)
		elseif G001 = 5 then ' z+
			if z_enable = 1 then
				move_dist = G003
				MoveArmIndex(0, 0, move_dist , 0, 20)
			else
				print "Z+ is bypassed"
				delay 100				
			end if
		elseif G001 = 6 then ' z-
			if z_enable = 1 then
				move_dist = (-1) * G003
				MoveArmIndex(0, 0, move_dist , 0, 20)
			else
				print "Z- is bypassed"
				delay 100								
			end if
		else
			stop
		end if
		G001 = 0				
		SetDI VIO_HMI_ENABLE_ACK
	wend				
End Sub

Sub CheckLightDO()
	if DO_CCD_LIGHT = -1 then
		MessagePopup(27)
		stop		
	end if
End Sub

Sub PTP_Test()
	Dim result as integer
	
	ConfirmPopup(28, result)
	if result = 0 then	
		stop
	end if
	
	ConfirmPopup(49, result)
	if result = 0 then	
		stop	
	end if

	if G021 = 1 then
		ConfirmPopup(50, result)
		if result = 0 then	
			stop	
		end if
	end if

	ConfirmPopup(29, result)
	if result = 0 then	
		stop	
	end if
		
	PointToPointTest0
End Sub

Sub PointToPointTest0
	Dim target_pos as position
	Dim arm_id as integer
	arm_id = ARM_0
	while TRUE
	TakeArm arm_id
		Speed 100
		Accel 100
		Decel 100

		'Move P,@E, SAFE_POSITION, S=100
		'target_pos = SAFE_POSITION		
		'WAIT DI_Z_RETRACTED, HIGH

		target_pos = CurPos(arm_id)

		' === Start Position ===		
		if G016 = 1 then
			LetX target_pos = PosX(P[PTP_TEST_START_POS_ID, arm_id])
		end if
		if G017 = 1 then
			LetY target_pos = PosY(P[PTP_TEST_START_POS_ID, arm_id])
		end if
		if G018 = 1 then
			LetZ target_pos = PosZ(P[PTP_TEST_START_POS_ID, arm_id])
		end if
		Move P,@E, target_pos, S=100
		
		' === Middle Position ===		
		if G021 = 1 then
		Delay 200
			if G016 = 1 then
				LetX target_pos = PosX(P[PTP_TEST_MIDDLE_POS_ID, arm_id])
			end if
			if G017 = 1 then
				LetY target_pos = PosY(P[PTP_TEST_MIDDLE_POS_ID, arm_id])
			end if
			if G018 = 1 then
				LetZ target_pos = PosZ(P[PTP_TEST_MIDDLE_POS_ID, arm_id])
			end if
			Move P,@E, target_pos, S=100
		end if

		Delay 200
		' === End Position ===
		if G016 = 1 then
			LetX target_pos = PosX(P[PTP_TEST_END_POS_ID, arm_id])
		end if
		if G017 = 1 then
			LetY target_pos = PosY(P[PTP_TEST_END_POS_ID, arm_id])
		end if
		if G018 = 1 then
			LetZ target_pos = PosZ(P[PTP_TEST_END_POS_ID, arm_id])
		end if
				
		Move P,@E, target_pos, S=100

		' === Middle Position ===		
		if G021 = 1 then
			Delay 200
			if G016 = 1 then
				LetX target_pos = PosX(P[PTP_TEST_MIDDLE_POS_ID, arm_id])
			end if
			if G017 = 1 then
				LetY target_pos = PosY(P[PTP_TEST_MIDDLE_POS_ID, arm_id])
			end if
			if G018 = 1 then
				LetZ target_pos = PosZ(P[PTP_TEST_MIDDLE_POS_ID, arm_id])
			end if
			Move P,@E, target_pos, S=100
		end if

		Delay 200

	GiveArm arm_id
	wend
End Sub

Sub LoadUnloadTest()
	Dim result as integer
	Dim test_type as integer
	
	RetractArm()
	
	ConfirmPopup(55, result)
	if result = 0 then
		stop
	end if

	while TRUE
		MessagePopup(56)

		if gEqAutoCim = 1 then
			PreStopperUp()
			PreConveyerRun()
			WaitSub(DI_BC_STAGE, HIGH)
			Delay 1500
			PreConveyerStop()
			AcquireBC(result)

			if result = BC_ERR_REMOVE then
				while GetDI(DI_BC_STAGE)=1
					MessagePopup(37) 'Please take out the board
					if gSysSimulation = 1 then
						break
					end if
				wend 			
				stop
			end if

			PreStopperDown()
			PreConveyerRun()	
			MainConveyerRun()
			WaitSub(DI_BC_STAGE, LOW)
			WaitSub(DI_LOAD_STAGE, HIGH)		
			PreConveyerStop()
		else	
			WaitSub(DI_LOAD_STAGE, HIGH)	
			MainConveyerRun()
		end if
			
		Delay 500
		WaitSub(DI_LOAD_STAGE, LOW)		
						
		MainStopperUp()		
		WaitSub(DI_WORK_STAGE, HIGH)
		Delay 1500
		MainConveyerStop()
	
		LiftUp()	
		Delay 1000
		MessagePopup(57)
		LiftDown()
		MainStopperDown()
				
		MainConveyerRun()
		WaitSub(DI_UNLOAD_STAGE, HIGH)
		MainConveyerStop()
		MessagePopup(42)
		WaitSub(DI_UNLOAD_STAGE, LOW)
	wend
End Sub

Sub AlignmentTest()
	Dim result as integer
	Dim test_type as integer
	
	RetractArm()

	test_type = G019
	
	ConfirmPopup(39, result)
	if result = 0 then
		stop
	end if
	
	RunTask VisionTask
	
	AssignPlatformEnum(test_type)
		
	'SetVisionMarkData()
	
	CCDTask(0)
	
	RetractArm()
	
	KillTask VisionTask
	
End Sub

Sub CimTest()
	Dim result as integer
	Dim need_reload as integer
	
	RetractArm()

	ConfirmPopup(77, result)

	if result = 0 then
		stop
	end if

	gEqAutoInline = 1

	RunTask TesterTask
	
	CimProcess(need_reload)
	if need_reload = TRUE then
		stop
	end if

	if (gSelfBypass = 0) and (gCimIsAlarm = 0) then
		ThreeOptionPopup(78, 79, 80, 81, result)
		if result = 0 then
			RtnResult(CIM_RTN_PRE_FAIL)
		elseif result = 1 then
			RtnResult(CIM_RTN_PROC_OK)
		else
 			RtnResult(CIM_RTN_PROC_NG)
		end if
	end if 

	KillTask TesterTask

End Sub