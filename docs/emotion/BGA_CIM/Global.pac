Const VERSION_NO = 2.78
Const VERSION_DATE = 20170616
' = 2.73 20170330 =
' Init Test Version (disable CIM) for ZZ to solve disconnect problem while switching projects
' = 2.74 20170413 =
' SwitchRecipe, ask HMI the active recipe
' = 2.75 20170516 =
' CIM Protocol V1.32
' = 2.76 20170612 =
' * process *,3A,ROUTE=OK,#
' = 2.77 20170613 =
' Put AckOK("Response") inside "if is_valid = TRUE then"
' = 2.78 20170616 =
' Tested with custom's server simulator


Const VISION_ENABLE = 1
Const VISION_EXE_EVERYTIME = 0
Const VISION_MAX_DELTA = 1.8 ' unit : mm 
Const VISION_MAX_SCALE = 2.5

Const MOVE_SAFE = 0
Const MOVE_SN = 1
Const MOVE_Z_SAFE = 2

Const SAFE_POS_ID = 4
Const XY_CALIBRATION_POS_ID = 5
Const SN_POS_ID = 6
Const Z_CALIBRATION_POS_ID = 7
Const PTP_TEST_START_POS_ID = 13
Const PTP_TEST_MIDDLE_POS_ID = 14
Const PTP_TEST_END_POS_ID = 15
Const NOZZLE_MAINTAIN_POS_ID = 16

Dim CIM_CMD_PROCESS as string
Dim CIM_CMD_BYPASS as string
'Dim CIM_CMD_ALARM as string
Dim CIM_CMD_NOT_AUTO as string
Dim CIM_CMD_AUTO_DONE as string
Dim CIM_CMD_WRONG_SIDE as string

Const CIM_CMD_ERR_NONE = 0
Const CIM_CMD_ERR_NOT_VALID_P = 1
Const CIM_CMD_ERR_NOT_VALID_R = 2
Const CIM_CMD_ERR_ALRAM = 3
Const CIM_CMD_ERR_WRONG_SIDE = 4
Const CIM_CMD_ERR_NOT_AUTO = 5
Const CIM_CMD_ERR_AUTO_DONE = 6

Dim CIM_RTN_PRE_FAIL as string ' used for IQC failure
Dim CIM_RTN_PROC_OK as string
Dim CIM_RTN_PROC_NG as string ' not  used yet.
Dim CIM_RTN_SN_FAIL as string
Dim CIM_RTN_NO_P_R as string
Dim CIM_RTN_ERR_SOLVED as string

Const BC_ERR_RETRY = 0
Const BC_ERR_REMOVE = 1
Const BC_ERR_KEY_IN = 2

Const ALIGN_ERR_RETRY = 0
Const ALIGN_ERR_REMOVE = 1

Const ARM_0 = 0

Const CCD_0 = 0
Const CCD_1 = 1

Const SIDE_T = 0
Const SIDE_B = 1

Const T_000 = 0
Const B_000 = 1

Dim ORG_TAG[2] as string

'Const PID_INVALID = 0
'Const PID_ZAGATO = 1
'Const PID_BERTONE = 2

' File name 
Const PRODUCT_INI = "product.ini"
Const RECIPE_DB = "recipe.db"
' == PreDefined Constants ==
Dim PI as double
Dim SQRT_2 as double
Dim RAD as double
Dim ONE_RAD as double

'== Delay ==
Dim BF_MARK_DELAY as integer
Dim BF_SN_DELAY as integer

'== Marks ==
'Dim A_MARK(2) as string
'Dim B_MARK(2) as string

'== Remove Glue ==
'Dim RMV_GLUE_DIST as double
'Dim RMV_GLUE_VEL as double
'== DI ==
Const DI_Z_PRESSURE = 14
Const DI_LOAD_STAGE = 16
Const DI_WORK_STAGE = 17
Const DI_UNLOAD_STAGE = 18
Const DI_STOPPER_UP = 19
Const DI_STOPPER_DOWN = 20
Const DI_LIFT_UP = 21
Const DI_LIFE_DOWN = 22
Const DI_LIFT_UP_2 = 23
Const DI_LIFE_DOWN_2 = 31
Const DI_Z_RETRACTED = 26
Const DI_UPSTREAM_READY = 32
Const DI_DOWNSTREAM_READY = 33
Const DI_BYPASS = 34 ' Only in CIM offline mode
Const DI_BC_STAGE = 37
Const DI_BC_STOPPER_UP = 38

'== D0 ==
Const DO_CONVEYER_RUN = 8
Const DO_LED_LIGHT = 9
Dim DO_CCD_LIGHT as integer
Const DO_HEATER = 11
Const DO_CCD_LIGHT_2 = 12
Const DO_BOTTOM_HEATER_POWER = 14
Const DO_HEATER_POWER = 15
Const DO_STOPPER = 16
Const DO_LIFT = 17
Const DO_BLOW = 18
Const DO_VACUUM = 19
Const DO_BC_STOPPER = 21
Const DO_BUZZER = 24
Const DO_BOTTOM_HEATER_ON = 28
Const DO_BOTTOM_HEATER_OFF = 29
Const DO_BC_CONVEYER_RUN = 30
Const DO_LOAD_REQ = 32
Const DO_UNLOAD_REQ = 33
Const DO_BYPASS = 35 ' Only in CIM offline mode

'== VIO ==
Const VIO_HMI_RESPONSE = 48
Const VIO_HMI_YES_NO = 49
Const VIO_AUTO_CALI_RESPONSE = 50
Const VIO_AUTO_CALI_RETRY = 51        
Const VIO_BOARD_READY = 52
Const VIO_DO_UNLOAD = 53
Const VIO_VISION_SN_ACK = 54
Const VIO_ERROR_BREAK = 55
Const VIO_AUTO_CALIBRATION = 56
Const VIO_ADJUST_TEST = 57
Const VIO_TESTER_SIMU = 58
Const VIO_VISION_SIMU = 59
Const VIO_LUL_BYPASS = 60
Const VIO_VISION_IQC_ACK = 63
Const VIO_VISION_SCALE_ACK = 64
Const VIO_VISION_INDEX_ACK = 65
Const VIO_VISION_DELTA_ACK = 66
Const VIO_HMI_ENABLE_ACK = 67
'68 do not use it
'69 do not use it
'70 do not use it
'71 do not use it
Const VIO_PAUSE_BF_DELTA = 72
Const VIO_PAUSE_AF_DELTA = 73
Const VIO_ARM_DONE = 74
Const VIO_CCD_CHECK = 75
Const VIO_BYPASS = 76
Const VIO_STOP_REQ = 77
Const VIO_REMOVE_GLUE = 79
Const VIO_TESTER_SIMU_WAIT = 80
Const VIO_TESTER_SIMU_ACK = 81
Const VIO_CIM_CMD_OK = 83

'======
Const MOVE_Y_THEN_X_Z = 0
Const MOVE_X_Y_Z = 1
' 88~99 SPARE
Const VIO_BC_WAIT_0 = 88
Const VIO_BC_WAIT_1 = 89

Const VIO_DEBUG_0 = 100
Const VIO_DEBUG_1 = 101

' == GLOBALS ==
Dim G000 as string
Dim G001 as integer
Dim G002 as integer
Dim G003 as double
Dim G004 as integer
Dim G005 as integer
Dim G006 as integer
Dim G007 as integer
Dim G008 as string
Dim G009 as integer
Dim G010 as integer
Dim G011 as integer
Dim G012 as integer
Dim G013 as integer
Dim G014 as integer
Dim G015 as integer
Dim G016 as integer
Dim G017 as integer
Dim G018 as integer
Dim G019 as integer
Dim G020 as integer
Dim G021 as integer
Dim G022 as integer
Dim G023 as integer
Dim G024 as integer
Dim G025 as integer

Dim G100 as string
Dim G101 as string
' == Variables ==
Dim gThetaDs as double ' 0: A(0), 1:A(90), 2:B(0), 3:B(90)
Dim gVisionDone as integer ' 0: A(0), 1:A(90), 2:B(0), 3:B(90)

Dim gSysCalibration as integer
Dim gAdjustTest as integer
Dim gFlatnessExam as integer
Dim gTesterSimu as integer
Dim gVisionSimu as integer
Dim gBoardLoaded as integer
Dim gSysSimulation as integer
Dim gSelfBypass as integer
Dim gPlatformSide as integer
Dim gPlatformEnum as integer
Dim gProductName as integer
Dim gReadingSN as integer
Dim gReadSN as string
Dim gReadIQC as string
Dim gTestIsEnding as integer
Dim gBoardExisting as integer
Dim gArmPointX[2], gArmPointY[2] as double
'Dim gPcbPointX[2], gPcbPointY[2] as double

Dim gMarkX[2,2], gMarkY[2,2] as double

'Dim gArmXCCDTmp, gArmYCCDTmp as double
'Dim gLUL_Bypass as integer
Dim gMarkName[2,2] as string
Dim gVisionAckData[2] as double
Dim ORG_POSITION as position
Dim SAFE_POSITION as position
Dim gCycleTimer as timer
Dim gZCalibration as integer
Dim gIQC_Failed as integer
Dim gTakenFromUnload as integer
Dim gGeneration as integer

Dim gCimCmd as string
Dim gCimProdcut as string
Dim gCimRecipe as string
Dim gCimComment as string
Dim gCimCmdErr as integer
Dim gCimIsAlarm as integer
Dim gIP as string
Dim gPort as integer
Dim gStationNo as integer
Dim gStationNoStr as string ' with preceding zero
Dim gLastEQ as integer
Dim gReadBC as string
Dim gBCSide as integer

' == Product == 
Dim gActiveProduct as string

' == Recipe ==
Dim gActiveRecipe as string
Dim gRecipeBGA as string
Dim gRecipeTimes as integer
Dim gRecipeX as double
Dim gRecipeY as double
Dim gRecipeV as double
Dim gRecipeT as integer
Dim gRecipeZ as double
Dim gRecipeVacuum as integer
Dim gRecipeBlow as integer
Dim gRecipeCX as double	'BGA centerX
Dim gRecipeCY as double	'BGA centerY
Dim gRecipeS as integer ' Side
Dim gRecipeIQC as integer

' == Machine Parameters ==
Dim TIP_CCD_X as double
Dim TIP_CCD_Y as double
Dim CCD_Z[2] as double
'Dim CCD_Z_OPPO as double
Dim CCD_Z_CALI as double
Dim Z_DIFF_T as double
Dim Z_DIFF_B as double
Dim Z_CALIB_H as double
Dim gEqAutoInline as integer
Dim gEqAutoCim as integer
Dim LOAD_INLINE as integer
Dim UNLOAD_INLINE as integer
Dim gEqAutoIqc as integer
Dim WARN_CNT as integer
Dim Z_POS_LIMIT as double

' == Process Parameters ==
Dim gLifeUsedTimer as timer
Dim gCycleCount as integer
Dim gTotalCount as integer

Sub InitialArmParam()        
        DO_CCD_LIGHT = 10
        
        ResetArmVIO()
        PI = 4.0*atan(1.0)
        RAD = PI/180.0        
        
        SQRT_2 = sqrt(2.0)
        print "SQRT_2=", SQRT_2
        
        ONE_RAD = 1.0/RAD'180/PI
        print "PI=", PI
        print "RAD=", RAD
        print "ONE_RAD=",  ONE_RAD
		'gLimitCount = 6

	CIM_CMD_PROCESS = "01"
	CIM_CMD_BYPASS = "10"
	'CIM_CMD_ALARM = "11"
	CIM_CMD_NOT_AUTO = "11"
	CIM_CMD_AUTO_DONE = "12"
	CIM_CMD_WRONG_SIDE = "6C"

	CIM_RTN_PRE_FAIL = "07"
	CIM_RTN_PROC_OK = "OK"
	CIM_RTN_PROC_NG = "09"
	CIM_RTN_SN_FAIL = "6A"
	CIM_RTN_NO_P_R = "6B"
	CIM_RTN_ERR_SOLVED = "00"

	ORG_TAG[T_000] = "t000"
	ORG_TAG[B_000] = "b000"
End Sub

Sub ResetArmVIO()
	gThetaDs = 0.0
	gReadingSN = 0
	gReadSN = ""
	gVisionDone = 0
	gVisionFailed = 0
	ResetDI VIO_ERROR_BREAK
	ResetDI VIO_BOARD_READY
	ResetDI VIO_CIM_CMD_OK
End Sub

Sub ResetSerialVIO(byval start_idx as integer, byval end_idx as integer)
	Dim idx as integer
	for idx = start_idx to end_idx
		ResetVioAndWait(idx)
	next
End Sub

Sub ResetVioAndWait(byval vio_idx as integer)
	ResetDI vio_idx
	WAIT vio_idx, LOW	
End Sub

Sub ThreeOptionPopup(byval msg_idx as integer, byval sub_msg_idx_0 as integer, byval sub_msg_idx_1 as integer, byval sub_msg_idx_2 as integer, byref result as integer)
	Dim send_msg as string
	send_msg = "C114," + CStr(VIO_HMI_RESPONSE) + "," + CStr(23) + "," + CStr(msg_idx) + "," + CStr(sub_msg_idx_0) + " " + CStr(sub_msg_idx_1) + " " + CStr(sub_msg_idx_2)
	SendCmdToHmi(send_msg)

	ResetVioAndWait(VIO_HMI_RESPONSE)
	WAIT VIO_HMI_RESPONSE, HIGH	
	ResetVioAndWait(VIO_HMI_RESPONSE)	
	result = G023	
End Sub

Sub NozzleMaintainPopup(byref result as integer)
	Dim send_msg as string
	send_msg = "C113," + CStr(VIO_HMI_RESPONSE) + ",23,63,62,15,9 11 18 19"
	SendCmdToHmi(send_msg)	
	ResetVioAndWait(VIO_HMI_RESPONSE)
	WAIT VIO_HMI_RESPONSE, HIGH	
	ResetVioAndWait(VIO_HMI_RESPONSE)
	result = G023
End Sub

Sub ConfirmPopup(byval msg_idx as integer, byref result as integer)
	Dim send_msg as string
	send_msg = "C100," + CStr(VIO_HMI_RESPONSE) + "," + CStr(VIO_HMI_YES_NO) + "," + CStr(msg_idx)
	SendCmdToHmi(send_msg)

	ResetVioAndWait(VIO_HMI_YES_NO)
	ResetVioAndWait(VIO_HMI_RESPONSE)
	WAIT VIO_HMI_RESPONSE, HIGH	
	ResetVioAndWait(VIO_HMI_RESPONSE)	
	result = GetDI(VIO_HMI_YES_NO)	
	ResetVioAndWait(VIO_HMI_YES_NO)
End Sub

'Sub MessagePopup(byval msg_txt as string)
Sub MessagePopup(byval msg_idx as integer)
	Dim send_msg as string
	'send_msg = "C100," + CStr(VIO_HMI_RESPONSE) + ",-1," + msg_txt
	send_msg = "C100," + CStr(VIO_HMI_RESPONSE) + ",-1," + CStr(msg_idx)
	SendCmdToHmi(send_msg)
	
	ResetVioAndWait(VIO_HMI_RESPONSE)	
	WAIT VIO_HMI_RESPONSE, HIGH	
	ResetVioAndWait(VIO_HMI_RESPONSE)	
End Sub

Sub MessageDisplay(byval msg_txt as string)
	Dim send_msg as string
	send_msg = "C103," + msg_txt
	SendCmdToHmi(send_msg)
End Sub

Sub MessageDisplay2(byval msg_idx as integer)
	Dim send_msg as string
	send_msg = "C103," + CStr(msg_idx)
	SendCmdToHmi(send_msg)
End Sub

Sub AdjustTestPopup()
	Dim result as integer
	Dim send_msg as string
	
	send_msg = "C105," + CStr(VIO_HMI_RESPONSE) + "," + CStr(VIO_HMI_YES_NO)
	SendCmdToHmi(send_msg)

	ResetVioAndWait(VIO_HMI_YES_NO)
	ResetVioAndWait(VIO_HMI_RESPONSE)
	WAIT VIO_HMI_RESPONSE, HIGH	
	ResetVioAndWait(VIO_HMI_RESPONSE)	
	result = GetDI(VIO_HMI_YES_NO)
	ResetVioAndWait(VIO_HMI_YES_NO)
	
	if result = 0 then
		stop
	end if
End Sub

Sub BcErrProcPopup(byref result as integer)
	Dim send_msg as string

	send_msg = "C117," + CStr(VIO_HMI_RESPONSE) + ",24"
	SendCmdToHmi(send_msg)

	ResetVioAndWait(VIO_HMI_RESPONSE)
	WAIT VIO_HMI_RESPONSE, HIGH	
	ResetVioAndWait(VIO_HMI_RESPONSE)
	result = G024
End Sub

Sub AlignmentErrProcPopup(byref result as integer)
	Dim send_msg as string

	send_msg = "C123," + CStr(VIO_HMI_RESPONSE) + ",25"
	SendCmdToHmi(send_msg)

	ResetVioAndWait(VIO_HMI_RESPONSE)
	WAIT VIO_HMI_RESPONSE, HIGH	
	ResetVioAndWait(VIO_HMI_RESPONSE)
	result = G025
End Sub

Sub ShowProductRecipe(byval p_name as string, byval r_name as string)
	print "C122,", p_name, ",", r_name
End Sub

Sub SendCmdToHmi(byval cmd as string)
	print cmd
End Sub

Sub SetAccDec(byval acc_val as double, byval dec_val as double)
	accel acc_val
	decel dec_val	
End Sub

Sub ShortBuzzer(byval cnt as integer)
	Dim idx as integer
	
	for idx = 1 to cnt
		SetDO DO_BUZZER
		Delay 100
		ReSetDO DO_BUZZER
		if idx < cnt then
			Delay 100
		end if
	next idx
End Sub

Sub SendTimeDiff(byval name as string)
	Dim end_time as double
	end_time = gCycleTimer.end()
	print "C108,", name, ",", CStr(end_time)
End Sub

Sub AccumulateCycleCount()
	Dim ini_file as FileSystem
	Dim key_str as string
	Dim count as integer
	
	' read data from database
	'==== Load Flying Prober database ====
	ini_file.open("eq.ini")
					
	key_str = "cycle_count"
	count = Cdbl(ini_file.get_ini("auto", key_str))
	gCycleCount = count + 1			
	ini_file.set_ini("auto", key_str, CStr(gCycleCount))

	key_str = "total_count"
	count = Cdbl(ini_file.get_ini("auto", key_str))
	gTotalCount = count + 1
	ini_file.set_ini("auto", key_str, CStr(gTotalCount))

	ini_file.close()
	print "C109,", gCycleCount, ",", gTotalCount
End Sub

Sub ResetCycleCount()
	Dim ini_file as FileSystem
	ini_file.open("eq.ini")
	gCycleCount = 0
	print "C109,0"
	ini_file.set_ini("auto", "cycle_count", "0")
	ini_file.close()
End Sub

Sub SendLifeUsedTime()
	Dim ini_file as FileSystem
	Dim rtn_str as string
	Dim key_str as string
	Dim total_used_time as double
	Dim used_time as double
	
	' read data from database
	'==== Load Flying Prober database ====
	ini_file.open("eq.ini")
					
	key_str = "life_time_used"
	total_used_time = Cdbl(ini_file.get_ini("auto", key_str))
	print key_str,"=", total_used_time
	
	used_time = gLifeUsedTimer.end()
	print "used_time = ",used_time
	
	total_used_time = total_used_time + used_time
	
	print "C110,", total_used_time
	
	ini_file.set_ini("auto", key_str, CStr(total_used_time))
	ini_file.close()
	
End Sub

Sub PreZero(byval proc_num as integer, byval n_char as integer, byref pre_str as string)
	Dim org_len as integer
	Dim tmp_str as string

	tmp_str = CStr(proc_num)
	org_len = len(tmp_str)

	pre_str = tmp_str

	while org_len < n_char
		pre_str = "0" + pre_str
		org_len = org_len + 1
	wend
End Sub

Sub WaitPrint(byval idx as integer, byval is_ok as integer)
	print "C119,", idx, ",", is_ok
End Sub

Sub WaitEnter(byval idx as integer, byval status as integer)
	print "C120,", idx, ",", status
End Sub

Sub WaitLeave(byval idx as integer, byval status as integer)
	print "C121,", idx, ",", status
End Sub

Sub WaitSub(byval idx as integer, byval status as integer)
	WaitEnter(idx, status)
	WAIT idx, status
	WaitLeave(idx, status)
End Sub
