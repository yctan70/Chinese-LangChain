Sub AutoCalibration()
	Dim result as integer
	Dim tmp_d as double
	Dim cur_pos as position	
	Dim corner0 as position
	Dim corner1 as position
	Dim center_pos as position
	
	RetractArm()
	
	'ResetDO DO_LIFT
	'SetDO DO_STOPPER
	
	ConfirmPopup(0, result)
	
	if result = 0 then	
		Stop
	end if	
	
	RunTask VisionTask

	ConfirmPopup(43, result) 
	if result = 1 then

		'SetDO DO_LIFT
	
		AssignPlatformEnum(T_000)	
	
		MoveArmToPoint(ARM_0, XY_CALIBRATION_POS_ID) ' Move tool to calibration area	
	
		ShowAutoCaliFailWnd(ARM_0, 1, 1, 24) ' Please move tool to calibration area

		TakeArm ARM_0	
			cur_pos = CurPos(ARM_0)
		GiveArm ARM_0
	
		gArmPointX[0] = PosX(cur_pos)
		gArmPointY[0] = PosY(cur_pos)
	
		MoveCCDToCurPos(ARM_0, CCD_Z_CALI)
	
		SetDO DO_CCD_LIGHT
		ShowAutoCaliFailWnd(ARM_0, 0, 1, 51) ' Please move CCD to the center0 of image

		TakeArm ARM_0	
			corner0 = CurPos(ARM_0)
		GiveArm ARM_0

		ShowAutoCaliFailWnd(ARM_0, 0, 1, 52) ' Please move CCD to the Corner1 of image

		TakeArm ARM_0	
			corner1 = CurPos(ARM_0)
		GiveArm ARM_0
		print "corner0=",corner0
		print "corner1=",corner1 

		center_pos = corner1

		tmp_d = PosX(corner0) + PosX(corner1)
		LetX center_pos = tmp_d/2

		tmp_d = PosY(corner0) + PosY(corner1)
		LetY center_pos = tmp_d/2
		print "center_pos=", center_pos

		ArmMoveToPos(center_pos, 1, 0)

		ShowAutoCaliFailWnd(ARM_0, 0, 1, 53) ' Please check the center

		ResetDO DO_CCD_LIGHT
	
		SaveTipCCD(ARM_0)
	
		'MoveCCDToComp(ARM_0, "TP04", MOVE_X_Y_Z)	
		'CalibrateCCD(ARM_0) ' Calibrate CCD-0	
		' Run top and bottom side alignment
		'SetVisionMarkData()
		'CCDTask(1) ' Run top side alignment
		'RetractArm()
		'ResetDO DO_LIFT
		'ResetDO DO_STOPPER
		'MessagePopup(31) ' Please rotate the board to side B
		'SetDO DO_STOPPER
		'MessagePopup(34)
		'SetDO DO_LIFT
		'AssignPlatformEnum(B_00)
		'SetVisionMarkData()
		'CCDTask(1) ' Run bottom side alignment
		'RetractArm()		
		'ResetDO DO_LIFT
		'ResetDO DO_STOPPER		
	end if

	if gZCalibration = 1 then
		ConfirmPopup(44, result) 
		if result = 1 then
			' Calibrate Z height	
			MoveArmToPoint(ARM_0, Z_CALIBRATION_POS_ID)

			ConfirmPopup(48, result) ' To ask if full auto-calibration
		
			CalibrateZ(result)		
		end if
	end if
	RetractArm()
	KillTask VisionTask

	MessagePopup(20) ' Calibration is complete
End Sub

'============
Sub CalibrateCCD(byval arm_id as integer)
	'Dim current_pos as position
	Dim tip_to_ccd_x as double
	Dim tip_to_ccd_y as double
	Dim x_cmd_index as double
	Dim y_cmd_index as double
	Dim ccd_center_pos as double
	
	SetDO DO_CCD_LIGHT
	
	Delay 1000 ' Do not remove me
	
	SendScaleToVision(arm_id)
	
	ResetDI VIO_VISION_INDEX_ACK	
	WAIT VIO_VISION_INDEX_ACK, LOW
	
	WAIT VIO_VISION_INDEX_ACK, HIGH
	ResetDI VIO_VISION_INDEX_ACK	
	
	x_cmd_index = gVisionAckData[0]
	y_cmd_index = gVisionAckData[1]
	
	MoveArmIndex(x_cmd_index, y_cmd_index, 0, 0, 20)
	
	Delay 1000 ' Do not remove me
	SendScaleToVision(arm_id)
	ResetDI VIO_VISION_SCALE_ACK
	WAIT VIO_VISION_SCALE_ACK, LOW
	WAIT VIO_VISION_SCALE_ACK, HIGH
	ResetDI VIO_VISION_SCALE_ACK
		
	ResetDO DO_CCD_LIGHT
	
	'TakeArm arm_id
	'current_pos = CurPos(arm_id)		
	'GiveArm arm_id
	
	'print "current_posX=", PosX(current_pos)
	'print "current_posY=", PosY(current_pos)
	print "VisionAckData[0]=", gVisionAckData[0]
	print "VisionAckData[1]=", gVisionAckData[1]
	print "gArmPointX=", gArmPointX[0]
	print "gArmPointY=", gArmPointY[0]
		
	'ccd_center_pos = PosX(current_pos) - gVisionAckData[0]
	'tip_to_ccd_x = gArmPointX[0] - ccd_center_pos
		
	'ccd_center_pos = PosY(current_pos) - gVisionAckData[1] 
	'tip_to_ccd_y = gArmPointY[0] - ccd_center_pos
			
	'print "tip_to_ccd_x=", tip_to_ccd_x
	'print "tip_to_ccd_y=", tip_to_ccd_y
	
	'SaveTipCCD(arm_id, tip_to_ccd_x, tip_to_ccd_y)
End Sub

Sub CalibrateZ(byval full_auto as integer)
	Dim db_file as FileSystem
	Dim cur_pos as Position
	Dim abs_idx as double
	Dim mov_idx as double

	SetDO DO_CCD_LIGHT_2
	while TRUE

		if full_auto = 1 then
			GetDeltaData(CCD_1, "NONE")
		else
			ShowAutoCaliFailWnd(ARM_0, 0, 1, 19)
		end if

		if gVisionFailed = 1 then
			' Popup a dialog for the operator to move Z axis manually	
			ShowAutoCaliFailWnd(ARM_0, 0, 1, 19)
		else
			abs_idx = abs(gVisionAckData[1])
			if (full_auto = 1) and (abs_idx > 0.01) then
   				mov_idx = (-1) * gVisionAckData[1]
				MoveArmIndex(0, 0, mov_idx, 0, 20)
			else
				' To save the position
				db_file.open("points.db")
				TakeArm ARM_0
					cur_pos = CurPos(ARM_0)
				GiveArm ARM_0
				P[Z_CALIBRATION_POS_ID, ARM_0] = cur_pos
				db_file.set_db("VariableP", "arm", ARM_0, "No", Z_CALIBRATION_POS_ID, "X", PosX(cur_pos))
				db_file.set_db("VariableP", "arm", ARM_0, "No", Z_CALIBRATION_POS_ID, "Y", PosY(cur_pos))				
				db_file.set_db("VariableP", "arm", ARM_0, "No", Z_CALIBRATION_POS_ID, "Z", PosZ(cur_pos))
				db_file.close()
				RefreshHmiPointPos(ARM_0, Z_CALIBRATION_POS_ID)
				break ' Calibration is done				
			end if
		end if
	wend
	ReSetDO DO_CCD_LIGHT_2

End Sub
