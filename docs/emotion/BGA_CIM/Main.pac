Program Main
	Dim first_run as integer

	ResetDO DO_BUZZER
	
	SetDO DO_BOTTOM_HEATER_POWER
	SetDO DO_HEATER_POWER
			
	first_run = 1
   
	gSysCalibration = GetDI(VIO_AUTO_CALIBRATION)
	
	gAdjustTest = GetDI(VIO_ADJUST_TEST)
	
	gVisionSimu = GetDI(VIO_VISION_SIMU)
	
	gLUL_Bypass = GetDI(VIO_LUL_BYPASS)	
		
	InitialArmParam()
		
	LoadDatabase()
	
	CheckLightDO()
	
	ResetDO DO_CCD_LIGHT	
	ReSetDO DO_LOAD_REQ
	ReSetDO DO_UNLOAD_REQ
	ReSetDO DO_CONVEYER_RUN
		
	if gSysCalibration = 1 then '== Auto Calibration Process ==
		AutoCalibration()		
	elseif gAdjustTest = 1 then		
		AdjustTestPopup()
		if G004 = 0 then
			ExamFlatness()
		elseif G004 = 1 then
			print "G004=1"
		elseif G004 = 2 then
			TwoCcdMoveToComp(0)
		elseif G004 = 3 then
			print "G004=3"
		elseif G004 = 4 then
			LinearityTest()
		elseif G004 = 5 then
			TwoCcdMoveToComp(1)	
		elseif G004 = 6 then
			PTP_Test()
		elseif G004 = 7 then
			print "G004=7"
		elseif G004 = 8 then 
			LoadUnloadTest()
		elseif G004 = 9 then
			AlignmentTest()				
		else
			print "Invalid G004"			
		end if
		Stop
	else '== Automation Process ==
		RetractArm()
		while GetDI(DI_WORK_STAGE)=1
			ResetDO DO_LIFT
			ResetDO DO_STOPPER			
			MessagePopup(41)
			if gSysSimulation = 1 then
				break
			end if
		wend 
		
		while GetDI(DI_UNLOAD_STAGE)=1
			MessagePopup(42)
			if gSysSimulation = 1 then
				break
			end if
		wend 
		
		
		if VISION_ENABLE = 1 then
			RunTask VisionTask
		end if
		
		if gLUL_Bypass = 0 then
			RunTask LoadUnloadTask
		end if
		
		RunTask WorkTask
		
		while TRUE
			if (gTestIsEnding = 1) or (first_run=1) then
				RunTask OtherTask0(MOVE_SAFE)
				WAIT VIO_ARM_DONE, HIGH
				ResetDI VIO_ARM_DONE
				'gBoardLoaded = 1
				gTestIsEnding = 0
				first_run = 0
			end if
			Delay 100
		wend
	end if
End Program

Sub LoadUnloadTask()
	while TRUE
		gBypass = GetDI(VIO_BYPASS)
		if LOAD_INLINE = 1 then ' Inline mode, to be implemented later			
			WAIT VIO_STOP_REQ, LOW			
			SetDO DO_LOAD_REQ
			'WAIT DI_UPSTREAM_READY, HIGH		
			SetDO DO_CONVEYER_RUN		
		end if 

		gTakenFromUnload = 0
		WAIT DI_LOAD_STAGE, HIGH
		SetDO DO_CONVEYER_RUN
		Delay 500
		ReSetDO DO_LOAD_REQ
				
		if LOAD_INLINE = 0 then
			SetDO DO_CONVEYER_RUN
		end if
		
		if gBypass = 0 then
			gCycleTimer.start()
			SetDO DO_STOPPER	
			if gSysSimulation = 0 then			
				WAIT DI_STOPPER_UP, HIGH
				WAIT DI_STOPPER_DOWN, LOW				
			end if	

			WAIT DI_WORK_STAGE, HIGH
			Delay 1500
			ResetDO DO_CONVEYER_RUN
	
			SetDO DO_LIFT	
			Delay 1000

			if gSysSimulation = 0 then
				WAIT DI_LIFT_UP, HIGH
				WAIT DI_LIFE_DOWN, LOW
				WAIT DI_LIFT_UP_2, HIGH
				WAIT DI_LIFE_DOWN_2, LOW
			end if
	
			ResetDO DO_STOPPER
			SendTimeDiff("LOAD")
			SetDI VIO_BOARD_READY
				
			WAIT VIO_DO_UNLOAD, HIGH
			ReSetDI VIO_DO_UNLOAD
		end if
		
		gCycleTimer.start()
		if (gBypass = 0) and (gSysSimulation = 0) and (gIQC_Failed = 0) then
			Delay 8000
		end if
		ResetDO DO_LIFT
		ResetDO DO_STOPPER

		if gSysSimulation = 0 then
			WAIT DI_STOPPER_UP, LOW
			WAIT DI_STOPPER_DOWN, HIGH		
			WAIT DI_LIFT_UP, LOW
			WAIT DI_LIFE_DOWN, HIGH
			WAIT DI_LIFT_UP_2, LOW
			WAIT DI_LIFE_DOWN_2, HIGH
		end if

		if (UNLOAD_INLINE = 1) and (gTakenFromUnload = 0) then
			SetDO DO_UNLOAD_REQ
			WAIT DI_WORK_STAGE, HIGH
			ReSetDO DO_CONVEYER_RUN
			WAIT DI_DOWNSTREAM_READY, HIGH	
			ReSetDO DO_UNLOAD_REQ		
		end if
		SetDO DO_CONVEYER_RUN
		WAIT DI_UNLOAD_STAGE, HIGH
		if (UNLOAD_INLINE = 0) or (gTakenFromUnload = 1) then
			ResetDO DO_CONVEYER_RUN
			if gIQC_Failed = 1 then
				ShortBuzzer(3)
				MessagePopup(42)
			end if
		end if
		WAIT DI_UNLOAD_STAGE, LOW
		if UNLOAD_INLINE = 1 then
			Delay 1000
		end if
		'WAIT DI_UNLOAD_STAGE, HIGH
		'WAIT DI_UNLOAD_STAGE, LOW
		ResetDO DO_CONVEYER_RUN
		SendTimeDiff("UNLOAD")
	wend
End Sub

Sub BottomHeater(byval switch as integer)
	if switch = 1 then
		ResetDO DO_BOTTOM_HEATER_OFF
		SetDO DO_BOTTOM_HEATER_ON
		Delay 500
		ResetDO DO_BOTTOM_HEATER_ON
	else
		ResetDO DO_BOTTOM_HEATER_ON
		SetDO DO_BOTTOM_HEATER_OFF
		Delay 500
		ResetDO DO_BOTTOM_HEATER_OFF
	end if
End Sub

'Sub UnloadTask()
'	ResetDO DO_LIFT	
'	WAIT DI_LIFT_UP, LOW
'	WAIT DI_LIFE_DOWN, HIGH
'	SetDO DO_CONVEYER_RUN
'	WAIT DI_UNLOAD_STAGE, HIGH
'	ResetDO DO_CONVEYER_RUN
'End Sub