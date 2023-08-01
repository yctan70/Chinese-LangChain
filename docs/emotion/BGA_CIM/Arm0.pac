Sub MainSub()
	Dim first_run as integer
	Dim result as integer

	ResetDO DO_BUZZER

	SetDO DO_BOTTOM_HEATER_POWER
	SetDO DO_HEATER_POWER
			
	first_run = 1
   
	gSysCalibration = GetDI(VIO_AUTO_CALIBRATION)
	
	gAdjustTest = GetDI(VIO_ADJUST_TEST)
	
	gVisionSimu = GetDI(VIO_VISION_SIMU)
	
	'gLUL_Bypass = GetDI(VIO_LUL_BYPASS)	
	
	gTesterSimu = GetDI(VIO_TESTER_SIMU)
		
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
			'ExamFlatness()
		elseif G004 = 1 then
			print "G004=1"
		elseif G004 = 2 then
			VisionMarkTest()
		elseif G004 = 3 then
			print "G004=3"
		elseif G004 = 4 then
			LinearityTest()
		elseif G004 = 5 then
			VisionScaleTest()
		elseif G004 = 6 then
			PTP_Test()
		elseif G004 = 7 then
			print "G004=7"
		elseif G004 = 8 then 
			LoadUnloadTest()
		elseif G004 = 9 then
			AlignmentTest()
		elseif G004 = 10 then
			CimTest()
		else
			print "Invalid G004"			
		end if
		Stop
	else '== Automation Process ==
		RetractArm()

		while GetDI(DI_BC_STAGE)=1
			MessagePopup(73)
			if gSysSimulation = 1 then
				break
			end if
		wend 

		while GetDI(DI_WORK_STAGE)=1
			ConfirmPopup(64, result)
			if result = 1 then
				ResetDO DO_LIFT
				ResetDO DO_STOPPER							
			end if
			MessagePopup(41)
			Delay 5000
			'if gSysSimulation = 1 then
			'	break
			'end if
		wend 
		
		while GetDI(DI_UNLOAD_STAGE)=1
			MessagePopup(42)
			if gSysSimulation = 1 then
				break
			end if
		wend 
		
		if gEqAutoCim = 1 then
			if gEqAutoInline = 1 then
				RunTask TesterTask
			end if
		end if
		
		if VISION_ENABLE = 1 then
			RunTask VisionTask
		end if
		
		'if gLUL_Bypass = 0 then
		RunTask LoadUnloadTask
		'end if
		
		RunTask WorkTask
		
		while TRUE
			if (gTestIsEnding = 1) or (first_run = 1) then
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
End Sub

Sub LoadUnloadTask()
	Dim result as integer
	Dim need_reload as integer
	Dim di_bypass as integer

	while TRUE
*StartLoad:
		'gSelfBypass = GetDI(VIO_BYPASS)
		gTakenFromUnload = 0
		gSelfBypass = 0
		di_bypass = 0
		if LOAD_INLINE = 1 then ' Inline mode, to be implemented later			
			WAIT VIO_STOP_REQ, LOW
			SetDO DO_LOAD_REQ
			WaitSub(DI_UPSTREAM_READY, HIGH)
			if gEqAutoCim = 1 then
				di_bypass = GetDI(DI_BYPASS) ' ON: The board is processed by upstream machine
				print "di_bypass=", di_bypass
				if di_bypass = 1 then
					gSelfBypass = 1
					print "gSelfBypass = 1, case-1"
				else
					if (UNLOAD_INLINE = 1) then
						if GetDI(DI_DOWNSTREAM_READY) = 1 then ' Downstream Machine is requesting(available)
							if gLastEQ = 0 then ' I am the last BGA machine, the it cannot bypass this board
								gSelfBypass = 1
								print "gSelfBypass = 1, case-2"
							end if
						end if
					end if
				end if

				'WAIT VIO_DEBUG_0, HIGH
				'ResetDI VIO_DEBUG_0

				if gEqAutoInline = 1 then
					PreStopperUp()
					PreConveyerRun()
					WaitSub(DI_BC_STAGE, HIGH)
					Delay 1500
					PreConveyerStop()
				else
					PreStopperDown()
					PreConveyerRun()
					WaitSub(DI_BC_STAGE, HIGH)				
				end if
			end if
		else ' Manual Load-in
			if gEqAutoCim = 1 then
				if gEqAutoInline = 1 then
					PreStopperUp()
					WaitSub(DI_BC_STAGE, HIGH)
					PreConveyerRun()
					Delay 1500
					PreConveyerStop()
				else
					PreStopperDown()
					WaitSub(DI_BC_STAGE, HIGH)
					PreConveyerRun()
				end if			
			end if
		end if 
		ReSetDO DO_LOAD_REQ
		'-----
		if gEqAutoCim = 1 then
			CimProcess(need_reload)
			if need_reload = TRUE then
				goto *StartLoad
			end if
			'----
			PreStopperDown()
			PreConveyerRun()
			MainConveyerRun()
			WaitSub(DI_BC_STAGE, LOW)
			WaitSub(DI_LOAD_STAGE, HIGH)		
			'------
			PreConveyerStop()
		else
			WaitSub(DI_LOAD_STAGE, HIGH)	
			MainConveyerRun()
		end if
		Delay 500
		WaitSub(DI_LOAD_STAGE, LOW)		
		
		if gSelfBypass = 0 then
			gCycleTimer.start()
			MainStopperUp()	

			WaitSub(DI_WORK_STAGE, HIGH)
			Delay 1500
			MainConveyerStop()
			LiftUp()	
			MainStopperDown()
			'ResetDO DO_STOPPER
			SendTimeDiff("LOAD")
			SetDI VIO_BOARD_READY
				
			WAIT VIO_DO_UNLOAD, HIGH
			ReSetDI VIO_DO_UNLOAD
		end if
		
		gCycleTimer.start()
		'if (gSelfBypass = 0) and (gSysSimulation = 0) and (gIQC_Failed = 0) then
		if (gSelfBypass = 0) and (gIQC_Failed = 0) then
			Delay 8000
		end if
		ResetDO DO_LED_LIGHT

		LiftDown()
		MainStopperDown()
		if gEqAutoCim = 1 then
			ReSetDO DO_BYPASS
		end if
		if (UNLOAD_INLINE = 1) and (gTakenFromUnload = 0) then
			if gEqAutoCim = 1 then
				if gEqAutoInline = 0 then
					if di_bypass = 1 then ' Force to bypass
						SetDO DO_BYPASS
						print "SetDO DO_BYPASS = 1, case-1"
					else
						if gSelfBypass = 0 then ' The board is processed
							SetDO DO_BYPASS
							print "SetDO DO_BYPASS = 1, case-2"
						else ' The board is not processed
							ReSetDO DO_BYPASS
							print "ReSetDO DO_BYPASS"
						end if
					end if
				end if
			end if
			'WAIT VIO_DEBUG_0, HIGH
			'ResetDI VIO_DEBUG_0

			Delay 500
			SetDO DO_UNLOAD_REQ
			WaitSub(DI_WORK_STAGE, HIGH)
			MainConveyerStop()
			WaitSub(DI_DOWNSTREAM_READY, HIGH)
			ReSetDO DO_UNLOAD_REQ		
		end if
		MainConveyerRun()
		WaitSub(DI_UNLOAD_STAGE, HIGH)
		if (UNLOAD_INLINE = 0) or (gTakenFromUnload = 1) then
			MainConveyerStop()
			'if gIQC_Failed = 1 then
			if gTakenFromUnload = 1 then
				ShortBuzzer(3)
				MessagePopup(42) ' Please take out the board, then press OK to continue
			end if
		end if
		WaitSub(DI_UNLOAD_STAGE, LOW)
		if UNLOAD_INLINE = 1 then
			Delay 1000
		end if
		'WAIT DI_UNLOAD_STAGE, HIGH
		'WAIT DI_UNLOAD_STAGE, LOW
		MainConveyerStop()
		SendTimeDiff("UNLOAD")
	wend
End Sub

Sub CimProcess(byref is_reload as integer)
	Dim bc_result as integer
	Dim msg_id as integer
	is_reload = FALSE
	if gEqAutoInline = 1 then ' Bar code Scanning
		AcquireBC(bc_result)

		if bc_result = BC_ERR_REMOVE then
			RtnResult(CIM_RTN_SN_FAIL)
			while GetDI(DI_BC_STAGE)=1
				MessagePopup(37) 'Please take out the board
				if gSysSimulation = 1 then
					break
				end if
			wend 			
			RtnResult(CIM_RTN_ERR_SOLVED)
			is_reload = TRUE
		end if

		if is_reload = FALSE then
			WaitPrint(92, 0)
			WAIT VIO_CIM_CMD_OK, HIGH
			ResetDI VIO_CIM_CMD_OK
			WaitPrint(92, 1)
	
			if gCimCmdErr <> CIM_CMD_ERR_NONE then
				'msg_id = GetCimCmdErrHmiMsgId(gCimCmdErr)
				'if gCimCmdErr = CIM_CMD_ERR_WRONG_SIDE then ' Wrong Side
				'	MessagePopup(msg_id)				
				'	while GetDI(DI_BC_STAGE)=0 ' do not continue until board is returned
				'		MessagePopup(msg_id)		
				'	wend
				'else ' Wrong Product / Recipe
					if (gCimCmdErr = CIM_CMD_ERR_NOT_VALID_P) or (gCimCmdErr = CIM_CMD_ERR_NOT_VALID_R) then
						RtnResult(CIM_RTN_NO_P_R)
					end if

					while GetDI(DI_BC_STAGE)=1
						msg_id = GetCimCmdErrHmiMsgId(gCimCmdErr)
						MessagePopup(msg_id) 'Please take out the board
						'if gSysSimulation = 1 then
						'	break
						'end if
					wend 
					RtnResult(CIM_RTN_ERR_SOLVED)
					is_reload = TRUE
				'end if
			else
				if gCimCmd = CIM_CMD_BYPASS then
					gSelfBypass = 1
				else
					gSelfBypass = 0
				end if
			end if
		end if
	end if
End Sub
'-----------Conveyer-----------
Sub PreConveyerRun()
	SetDO DO_BC_CONVEYER_RUN
End Sub

Sub PreConveyerStop()
	ResetDO DO_BC_CONVEYER_RUN
End Sub

Sub MainConveyerRun()
	SetDO DO_CONVEYER_RUN
End Sub

Sub MainConveyerStop()
	ResetDO DO_CONVEYER_RUN
End Sub
'----------- Stopper and Lift-----------
Sub PreStopperUp()
	SetDO DO_BC_STOPPER
	WaitSub(DI_BC_STOPPER_UP, HIGH)				
End Sub

Sub PreStopperDown()
	ResetDO DO_BC_STOPPER
	WaitSub(DI_BC_STOPPER_UP, LOW)
End Sub

Sub MainStopperUp()
	SetDO DO_STOPPER
	if gSysSimulation = 0 then			
		WaitSub(DI_STOPPER_UP, HIGH)
		WaitSub(DI_STOPPER_DOWN, LOW)				
	end if	
End Sub

Sub MainStopperDown()
	ResetDO DO_STOPPER
	if gSysSimulation = 0 then			
		WaitSub(DI_STOPPER_UP, LOW)
		WaitSub(DI_STOPPER_DOWN, HIGH)
	end if	
End Sub

Sub LiftUp()
	SetDO DO_LIFT
	Delay 1000
	if gSysSimulation = 0 then
		WaitSub(DI_LIFT_UP, HIGH)
		WaitSub(DI_LIFE_DOWN, LOW)

		if gGeneration = 2 then
			WaitSub(DI_LIFT_UP_2, HIGH)
			WaitSub(DI_LIFE_DOWN_2, LOW)
		end if
	end if
End Sub

Sub LiftDown()
	ResetDO DO_LIFT
	if gSysSimulation = 0 then
		WaitSub(DI_LIFT_UP, LOW)
		WaitSub(DI_LIFE_DOWN, HIGH)

		if gGeneration = 2 then
			WaitSub(DI_LIFT_UP_2, LOW)
			WaitSub(DI_LIFE_DOWN_2, HIGH)
		end if
	end if
End Sub
'-----------------------------------
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

Sub WorkTask()	
	Dim target_pos as position
	Dim arm_id as integer
	Dim result as integer
	Dim maintain_result as integer
	'Dim sel as integer
	Dim query_result as integer
	Dim run_pt_no as integer
	Dim lastV as double
	Dim x_offset as double
	Dim y_offset as double
	Dim ccd_check as integer
	Dim continuous as integer
	Dim hmi_msg as string
	Dim test_times as integer
	Dim check_pos as position
	Dim x_diff as double
	Dim y_diff as double
	Dim z_diff as double
	Dim cy_count as integer
	'Dim IQC_Failed as integer
	Dim overrun_continue as integer

	arm_id = ARM_0
	
	test_times = 0
	
	while TRUE					
		' WAIT VIO here
'		while gSelfBypass = 1
'			WAIT VIO_BOARD_READY,HIGH
'			ResetDI VIO_BOARD_READY
'			print "Nothing to do, just bypass"
'			SetDI VIO_DO_UNLOAD
'		wend 
		
		WAIT VIO_BOARD_READY,HIGH
		ResetDI VIO_BOARD_READY		
		
		gCycleTimer.start()
		gLifeUsedTimer.start()
		
		query_result = 1
		
		continuous = 0
		
		ccd_check = GetDI(VIO_CCD_CHECK)
		
'		if ccd_check = 0 then
'			while (query_result = 1)
'				OtherTask0(MOVE_SN)			
'				if gReadSN = "FAIL" then
'					ConfirmPopup(14, query_result)
'				else
'					query_result = 0
'				end if	
'			wend
'		end if

		if test_times = 0 then
			gIQC_Failed = 0
			if gEqAutoIqc = 1 then
				SetDO DO_CCD_LIGHT
				GetPreciseOffset(arm_id, gRecipeCX, gRecipeCY, x_offset, y_offset)
				TakeArm arm_id
					LetX target_pos = PosX(ORG_POSITION) + x_offset - TIP_CCD_X
					LetY target_pos = PosY(ORG_POSITION) + y_offset - TIP_CCD_Y
					'if gPlatformEnum = T_000 then
						LetZ target_pos = CCD_Z[gPlatformSide]
					'else
					'	LetZ target_pos = CCD_Z_OPPO
					'end if

					print "IQC target pos=", target_pos
					Move P,@E,target_pos,S=100
					GetIQCData()					
				GiveArm arm_id
				ResetDO DO_CCD_LIGHT
				if (gReadIQC = "") or (gReadIQC = "NG") then
					ConfirmPopup(35, query_result) ' IQC Failed, continue the process?
					if query_result = 1 then
						gIQC_Failed = 0
					else
						RtnResult(CIM_RTN_PRE_FAIL)
						gIQC_Failed = 1
						'gTakenFromUnload = 1
					end if
				end if
			end if

			if gIQC_Failed = 0 then
				CCDTask(0)				
			end if
		end if

		'overrun_continue = 1		
'		result = 0
'		if (gIQC_Failed = 0) and (ccd_check = 0) then
'			' Check if cycle count greater than the setting
'			if (gCycleCount > WARN_CNT) and (WARN_CNT <> 0) then
'				ShortBuzzer(3)
'				ThreeOptionPopup(59, 60, 61, 62, result) '0: continue, 1: maintain, 2:unload
'				'ConfirmPopup(36, overrun_continue)
'			end if
'		end if

'		if result = 1 then ' maintain
'			'WAIT 100, HIGH
'			'ResetDI 100
'			MoveArmToPoint(ARM_0, NOZZLE_MAINTAIN_POS_ID)
'			NozzleMaintainPopup(maintain_result)
'			if maintain_result = 0 then ' complete
'				ResetCycleCount()
'			elseif maintain_result =  1 then ' unload
'				result = 2
'			end if
'		end if
		
		if (gVisionFailed = 1) or (gIQC_Failed = 1) then
			print "Do Unload"
			print "result=", result
			gTestIsEnding = 1
			gTakenFromUnload = 1
			SetDI VIO_DO_UNLOAD
		else	
			print "Do Process"
			SetDO DO_HEATER
			Delay 500
			ResetDO DO_HEATER
			Delay 500
			if ccd_check = 0 then
				BottomHeater(1)
				if gSysSimulation = 0 then
					Delay 100
				end if
				SetDO DO_LED_LIGHT
			else
				SetDO DO_CCD_LIGHT
			end if
			
			'SetDO DO_VACUUM
			
			TakeArm arm_id
				run_pt_no = 1
				result = 0
				accel 20
				decel 20

				while result=0									
					print "Ready to run Point[", run_pt_no, "]"
			
					GetRecipe(run_pt_no, result)
			
					if result = -1 then
						print "Work is over!"
					else
						GetPreciseOffset(arm_id, gRecipeX, gRecipeY, x_offset, y_offset)
						if ccd_check = 0 then
							LetX target_pos = PosX(ORG_POSITION) + x_offset
							LetY target_pos = PosY(ORG_POSITION) + y_offset
							LetZ target_pos = PosZ(ORG_POSITION)
							
							if run_pt_no = 1 then
								LetZ target_pos = PosZ(target_pos) + 25
								print "target_pos=", target_pos
								Move P,@E,target_pos,S=100
							else					
								LetZ target_pos = PosZ(CurPos(arm_id))			
								'Move P,@E,target_pos,S=lastV
								print "recipe target_pos=", target_pos, ",V=", lastV
								Move L,@E,target_pos,vel=lastV
							end if				
				
							LetZ target_pos = PosZ(ORG_POSITION) + gRecipeZ	

							Move P,@E,target_pos,S=100						
						else
							LetX target_pos = PosX(ORG_POSITION) + x_offset - TIP_CCD_X
							LetY target_pos = PosY(ORG_POSITION) + y_offset - TIP_CCD_Y
							'if gPlatformEnum = T_000 then
								LetZ target_pos = CCD_Z[gPlatformSide]
							'else
							'	LetZ target_pos = CCD_Z_OPPO
							'end if
							'print "CCD Check=", target_pos
							if run_pt_no = 1 then
								Move P,@E,target_pos,S=100
							else
								'Move P,@E,target_pos,S=lastV
								print "ccd check target_pos=", target_pos
								Move L,@E,target_pos,vel=lastV
							end if
						end if
														
						hmi_msg = "C107," + CStr(run_pt_no-1)
						SendCmdToHmi(hmi_msg)
						' In Position and do delay
						if (ccd_check = 0) and (gRecipeVacuum = 1) then
							SetDO DO_VACUUM
						else
							Delay 100
							ResetDO DO_VACUUM
						end if

						if (ccd_check = 0) and (gRecipeBlow = 1) then
							SetDO DO_BLOW
						else
							ResetDO DO_BLOW
						end if
												
						if ccd_check = 1 then
							if continuous = 0 then
								'MessagePopup(34)
								ConfirmPopup(38, query_result)
								if query_result = 0 then
									continuous = 1
								end if
				
								SendCmdToVision("T1,1,REC,2.75,#")
								SendCmdToHmi("C106,FxVision")
								Delay 1000
							end if
						else
							if (test_times = 0) or (run_pt_no <> 1) then
								Delay gRecipeT
							end if
						end if
				
						lastV = gRecipeV				
						run_pt_no = run_pt_no + 1
					end if			
				wend
			GiveArm arm_id	
			SendCmdToHmi("C107,-1")
			query_result = 0
			if ccd_check = 0 then
				BottomHeater(0)
				SetDO DO_HEATER
				Delay 500
				ResetDO DO_HEATER			
				'ResetDO DO_VACUUM
			else				
				ConfirmPopup(14, query_result) ' Do it again?		
			end if

			SendTimeDiff("WORK")
			SendLifeUsedTime()
			
			result = 0
			if ccd_check = 0 then
				AccumulateCycleCount()
				' Had better to ask if maintain nozzle here				
				' Check if cycle count greater than the setting
				if (gCycleCount >= WARN_CNT) and (WARN_CNT <> 0) then
					TakeArm arm_id
						target_pos = CurPos(arm_id)
						LetZ target_pos = PosZ(target_pos) + 25
						Move P,@E,target_pos,S=100
					GiveArm arm_id
					ShortBuzzer(3)
					ThreeOptionPopup(59, 60, 61, 62, result) '0: continue, 1: maintain, 2:unload
				end if				

				if result = 1 then ' maintain
					MoveArmToPoint(ARM_0, NOZZLE_MAINTAIN_POS_ID)
					NozzleMaintainPopup(maintain_result)
					if maintain_result = 0 then ' complete
						ResetCycleCount()
					elseif maintain_result =  1 then ' unload
						result = 2
					end if
				end if
			end if			
			
			if query_result = 0 then				
				if ccd_check = 0 then					
					test_times  = test_times + 1
					print "test_times=", test_times
					if (result = 2) or (test_times = gRecipeTimes) or (test_times > gRecipeTimes) then
						'print "result=", result
						test_times = 0
						gTestIsEnding = 1
						RtnResult(CIM_RTN_PROC_OK)
						SetDI VIO_DO_UNLOAD
					else
						SetDI VIO_BOARD_READY
					end if
				else
					gTestIsEnding = 1
					SetDI VIO_DO_UNLOAD
				end if
			else
				SetDI VIO_BOARD_READY
			end if			
		end if
	wend
End Sub

Sub OtherTask0(byval move_type as integer)	
	Dim arm_id as integer
        Dim target_pos as position
        
	arm_id = ARM_0
	ResetDI VIO_ARM_DONE
	
	if move_type = MOVE_SAFE then
		TakeArm arm_id
			accel 20
			decel 20		
			target_pos = CurPos(arm_id)				
			LetZ target_pos =  PosZ(SAFE_POSITION) 
			Move P,@E,target_pos,S=80
			Move P,@E,SAFE_POSITION,S=80	
			ResetDO DO_VACUUM		
			SETDI VIO_ARM_DONE
		GiveArm arm_id		 
	elseif move_type = MOVE_Z_SAFE then
		TakeArm arm_id
			accel 20
			decel 20		
			target_pos = CurPos(arm_id)	
			LetZ target_pos =  PosZ(SAFE_POSITION) 
			Move P,@E,target_pos,S=80
			SETDI VIO_ARM_DONE
		GiveArm arm_id		 	
	elseif move_type = MOVE_SN then
		TakeArm arm_id
			Accel 100
			Decel 100		
			target_pos = CurPos(arm_id)				
			LetZ target_pos =  PosZ(P[SAFE_POS_ID, arm_id]) 
			Move P,@E,target_pos,S=100
			Move P,@E,P[SAFE_POS_ID, arm_id],S=100
		GiveArm arm_id		
		
		SetDO DO_CCD_LIGHT
		ArmMoveToPos(P[SN_POS_ID, arm_id], 1, MOVE_X_Y_Z)
		Delay BF_SN_DELAY		
		GetSerialNumber()		
		ResetDO DO_CCD_LIGHT
		SETDI VIO_ARM_DONE				
	end if	
End Sub

Sub AcquireBC(byref result as integer)
	
	result = BC_ERR_RETRY

	while result = BC_ERR_RETRY	
		ResetVioAndWait(VIO_BC_WAIT_0)
		ResetVioAndWait(VIO_BC_WAIT_1)
		print "C116,0"
		'print "C116,1"
		WaitPrint(91, 0)

		WAIT VIO_BC_WAIT_0, HIGH
		ResetVioAndWait(VIO_BC_WAIT_0)
		print "G100=", G100
		if G100 = "" then
			print "C116,1"
			WAIT VIO_BC_WAIT_1, HIGH
			print "G101=", G101
		end if
		WaitPrint(91, 1)
		ResetVioAndWait(VIO_BC_WAIT_1)
		if (G100 = "") and (G101 = "") then
			BcErrProcPopup(result)
		else
			break
		end if
	wend

	if result <> BC_ERR_REMOVE then
		if G100 <> "" then 
			gReadBC = G100 
			gBCSide = SIDE_T
		elseif G101 <> "" then
			gReadBC = G101
			gBCSide = SIDE_B
		end if
		AckBC()
	else
		gReadBC = ""
	end if
	
	print "gReadBC=", gReadBC
End Sub

Sub BcTest()
	Dim result as integer
	while TRUE
		WAIT VIO_DEBUG_0, HIGH
		ResetDI VIO_DEBUG_0
	
		AcquireBC(result)

		if result = BC_ERR_REMOVE then
			break
		end if
	wend
End Sub

'Sub LiftUntilPresssureOff
'	Dim target_pos as position

'	if GetDI(VIO_REMOVE_GLUE ) = 1 then

'		if GetDI(DI_Z_PRESSURE) = 0 then ' High Pressure
'			while GetDI(DI_Z_PRESSURE) = 0
'				target_pos = CurPos(ARM_0)
'				LetZ target_pos = PosZ(target_pos) + RMV_GLUE_DIST
'				Move L,@E,target_pos,vel=RMV_GLUE_VEL
'				'WAIT VIO_DEBUG_0, HIGH
'				'ResetDI VIO_DEBUG_0
'			wend
'		else
'			while GetDI(DI_Z_PRESSURE) = 1
'				target_pos = CurPos(ARM_0)
'				LetZ target_pos = PosZ(target_pos) - RMV_GLUE_DIST
'				Move L,@E,target_pos,vel=RMV_GLUE_VEL
'				'WAIT VIO_DEBUG_1, HIGH
'				'ResetDI VIO_DEBUG_1
'			wend
'			LetZ target_pos = PosZ(target_pos) + RMV_GLUE_DIST
'			Move L,@E,target_pos,vel=RMV_GLUE_VEL					
'		end if

'	end if
'End Sub
