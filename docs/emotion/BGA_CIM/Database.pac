' ============
Sub LoadDatabase()
	Dim ini_file as FileSystem
	Dim db_file as FileSystem
	Dim rtn_str as string
	Dim key_str as string
	Dim life_used_time as double
	Dim ip4 as string
	Dim ip3 as string
	Dim ip2 as string
	Dim ip1 as string
	
	'==== Load parameters.db ====
	db_file.open("parameters.db")
	gSysSimulation = Cdbl(db_file.get_db("emotion", "Key", "offline", "value"))
	print "gSysSimulation=", gSysSimulation       	
	Z_POS_LIMIT = Cdbl(db_file.get_db("axis_2", "key", "poslimit", "value"))
	print "Z_POS_LIMIT=", Z_POS_LIMIT       	 		
	db_file.close()
	
	SAFE_POSITION = P[SAFE_POS_ID, ARM_0]
	
	'==== Load Flying Prober database ====
	ini_file.open("eq.ini")
	
	key_str = "cim"
	gEqAutoCim = Cint(ini_file.get_ini("auto", key_str))	
	print key_str,"=", gEqAutoCim
					
	key_str = "tip_ccd_x"
	TIP_CCD_X = Cdbl(ini_file.get_ini("arm", key_str))		
	print key_str,"=", TIP_CCD_X
	
	key_str = "tip_ccd_y"
	TIP_CCD_Y = Cdbl(ini_file.get_ini("arm", key_str))		
	print key_str,"=", TIP_CCD_Y	
	
	key_str = "ccd_z_t"
	CCD_Z[SIDE_T] = Cdbl(ini_file.get_ini("arm", key_str))	
	print key_str,"=", CCD_Z[SIDE_T]
	
	key_str = "ccd_z_b"
	CCD_Z[SIDE_B] = Cdbl(ini_file.get_ini("arm", key_str))	
	print key_str,"=", CCD_Z[SIDE_B]
	
	key_str = "ccd_z_c"
	CCD_Z_CALI = Cdbl(ini_file.get_ini("arm", key_str))	
	print key_str,"=", CCD_Z_CALI
	
	key_str = "ccd_do"
	DO_CCD_LIGHT = Cint(ini_file.get_ini("arm", key_str))	
	print key_str,"=", DO_CCD_LIGHT
					
	if gEqAutoCim = 1 then
		key_str = "inline"
		gEqAutoInline = Cint(ini_file.get_ini("auto", key_str))	
	else
		gEqAutoInline = 0
	end if
	print key_str,"=", gEqAutoInline

	key_str = "load_inline"
	LOAD_INLINE = Cint(ini_file.get_ini("auto", key_str))	
	print key_str,"=", LOAD_INLINE

	key_str = "unload_inline"
	UNLOAD_INLINE = Cint(ini_file.get_ini("auto", key_str))	
	print key_str,"=", UNLOAD_INLINE	
	
	key_str = "cycle_count"
	gCycleCount = Cint(ini_file.get_ini("auto", key_str))	
	print key_str,"=", gCycleCount

	key_str = "total_count"
	gTotalCount = Cint(ini_file.get_ini("auto", key_str))	
	print key_str,"=", gTotalCount

	key_str = "warn_count"
	WARN_CNT = Cint(ini_file.get_ini("auto", key_str))	
	print key_str,"=", WARN_CNT

	key_str = "iqc"
	gEqAutoIqc = Cint(ini_file.get_ini("auto", key_str))	
	print key_str,"=", gEqAutoIqc


	BF_MARK_DELAY = Cint(ini_file.get_ini("delay", "bf_mark"))
	if BF_MARK_DELAY = 0 then
		BF_MARK_DELAY = 700
	end if
	print "BF_MARK_DELAY=", BF_MARK_DELAY
	
	'==================
	gZCalibration = Cint(ini_file.get_ini("arm", "z_calibration"))
	print "gZCalibration=", gZCalibration

	if gZCalibration = 1 then
		Z_DIFF_T = Cdbl(ini_file.get_ini("arm", "z_diff_t"))
		print "Z_DIFF_T=", Z_DIFF_T
		Z_DIFF_B = Cdbl(ini_file.get_ini("arm", "z_diff_b"))
		print "Z_DIFF_B=", Z_DIFF_B
		gGeneration = 2
	else
		gGeneration = 1	
	end if
	'===================
	ip4 = ini_file.get_ini("auto", "ip4")
	ip3 = ini_file.get_ini("auto", "ip3")
	ip2 = ini_file.get_ini("auto", "ip2")
	ip1 = ini_file.get_ini("auto", "ip1")
	gIP = ip4 + "." + ip3 + "." + ip2 + "." + ip1
	print "IP=", gIP
	gPort = Cint(ini_file.get_ini("auto", "port"))
	print "Port=", gPort

	gStationNo = Cint(ini_file.get_ini("auto", "station_no"))
	print "gStationNo=", gStationNo

	'PreZero(gStationNo, 2, gStationNoStr)
	gStationNoStr = CStr(gStationNo) + "A"
	print "gStationNoStr=", gStationNoStr

	gLastEQ = Cint(ini_file.get_ini("auto", "last_eq"))
	print "gLastEQ=", gLastEQ

	'key_str = "cycle_count"
	'cycle_count = Cdbl(db_file.get_db("calibration", "key", key_str , "value"))		
	'print key_str,"=", cycle_count	
	
	'key_str = "life_time_used"
	'life_used_time = Cdbl(db_file.get_db("calibration", "key", key_str , "value"))		
	'print key_str,"=", life_used_time							
	ini_file.close()		

	' == Information of product.ini ==	
	if gEqAutoInline = 0 then
		SwitchProduct(TRUE, "")
	end if
	'==== Load Points ====
	db_file.open("points.db")
	if gZCalibration = 1 then		
		LetX P[Z_CALIBRATION_POS_ID, ARM_0] = Cdbl(db_file.get_db("VariableP", "arm", 0, "No", Z_CALIBRATION_POS_ID, "X"))
		LetY P[Z_CALIBRATION_POS_ID, ARM_0] = Cdbl(db_file.get_db("VariableP", "arm", 0, "No", Z_CALIBRATION_POS_ID, "Y"))
		LetZ P[Z_CALIBRATION_POS_ID, ARM_0] = Cdbl(db_file.get_db("VariableP", "arm", 0, "No", Z_CALIBRATION_POS_ID, "Z"))
		'Z_CALIB_H = PosZ(P[Z_CALIBRATION_POS_ID, ARM_0])
		Z_CALIB_H = Cdbl(db_file.get_db("VariableP", "arm", 0, "No", Z_CALIBRATION_POS_ID, "Z"))
		print "Z_CALIB_H=", Z_CALIB_H
	end if
	db_file.close()
	'==== Load Recipe ====
	if (gSysCalibration = 0) and (gAdjustTest = 0) and (gEqAutoInline = 0) then
		SwitchRecipe(TRUE, "")
	else
		AssignPlatformEnum(T_000)	
		'SetVisionMarkData()
	end if
	
	CheckTipToCCD()
	if gEqAutoInline = 0 then
		ShowProductRecipe(gActiveProduct, gActiveRecipe)
	end if
End Sub
' ============
Sub SwitchProduct(byval is_from_db as integer, byval product_name as string)
	Dim ini_file as FileSystem
	Dim rtn_str as string
	Dim arg_buf[3] as string
	Dim side as integer
	Dim idx as integer
	Dim tag_name[2,2] as string

	ini_file.open(PRODUCT_INI)

	if is_from_db = TRUE then
		gActiveProduct = ini_file.get_ini("product", "active")
		print "[product] active=", gActiveProduct
		if gActiveProduct = "" then
			MessagePopup(82)
		end if
	else
		gActiveProduct = product_name
	end if

	rtn_str = ini_file.get_ini(gActiveProduct, "t000")
	arg_buf = split(rtn_str, ",")
	LetX P[T_000, ARM_0] = Cdbl(arg_buf[0])
	LetY P[T_000, ARM_0] = Cdbl(arg_buf[1])
	LetZ P[T_000, ARM_0] = Cdbl(arg_buf[2])

	rtn_str = ini_file.get_ini(gActiveProduct, "b000")
	arg_buf = split(rtn_str, ",")
	LetX P[B_000, ARM_0] = Cdbl(arg_buf[0])
	LetY P[B_000, ARM_0] = Cdbl(arg_buf[1])
	LetZ P[B_000, ARM_0] = Cdbl(arg_buf[2])
	print "P[T_000, ARM_0] =", P[T_000, ARM_0] 
	print "P[B_000, ARM_0] =", P[B_000, ARM_0]
	'----
	tag_name[SIDE_T, 0] = "t_mark0"
	tag_name[SIDE_T, 1] = "t_mark1"
	tag_name[SIDE_B, 0] = "b_mark0"
	tag_name[SIDE_B, 1] = "b_mark1"
	for side = 0 to 1 ' side
		for idx = 0 to 1 ' mark index
			rtn_str = ini_file.get_ini(gActiveProduct, tag_name[side, idx])			
			arg_buf = split(rtn_str, ",")
			gMarkName[side, idx] = arg_buf[0]
			gMarkX[side, idx] = Cdbl(arg_buf[1])
			gMarkY[side, idx] = Cdbl(arg_buf[2])
			print "Mark[", side, ",", idx, "], Name=", gMarkName[side, idx], ", X=", gMarkX[side, idx], ",Y=", gMarkY[side, idx]
		next idx
	next side
	ini_file.close()
End Sub
' ============
Sub SwitchRecipe(byval is_from_db as integer, byval recipe_name as string)
	Dim db_file as FileSystem
	Dim rtn_ary(2) as string
        Dim rtn_str as string
	Dim combo_name as string
	Dim p_l as integer
	Dim total_len as integer
	Dim exe_str as string

	db_file.open(RECIPE_DB)

	if is_from_db = TRUE then		
		'exe_str = "SELECT NAME FROM Settings WHERE NAME like " + "\"" + gActiveProduct + "\_%" + "\"" + " escape '\'" + " and active=1"				
		'db_file.exe_cmd(exe_str, rtn_ary)
		'combo_name = rtn_ary[0]
		'print "combo_name=", combo_name
		'if combo_name = "" then
		'	MessagePopup(83)
		'end if
		
		'p_l = Len(gActiveProduct)
		'total_len = Len(combo_name)
		'gActiveRecipe = Right(combo_name, total_len - p_l - 2)		
		
		ResetVioAndWait(VIO_HMI_RESPONSE)
		print "C125,", gActiveProduct, ",", VIO_HMI_RESPONSE
		'print "C125,A,", VIO_HMI_RESPONSE

		WAIT VIO_HMI_RESPONSE, HIGH	
		ResetVioAndWait(VIO_HMI_RESPONSE)	
		print "HMI response gActiveRecipe=", gActiveRecipe
		if gActiveRecipe = "" then
			MessagePopup(83)
		else
			combo_name = gActiveProduct + "__" + gActiveRecipe
			print "combo_name=", combo_name			
		end if
	else
		gActiveRecipe = recipe_name
		combo_name = gActiveProduct + "__" + gActiveRecipe
	end if

	print "Active Recipe=", gActiveRecipe	
	print "combo_name=", combo_name

	rtn_str = db_file.get_db("Settings", "NAME", combo_name , "S")
	gRecipeS = Cint(rtn_str)

	if gRecipeS = SIDE_T then
		AssignPlatformEnum(T_000)		
	elseif gRecipeS = SIDE_B then
		AssignPlatformEnum(B_000)		
	else
		print "ERROR"
		db_file.close()	
		stop
	end if	

	rtn_str = db_file.get_db("Settings", "NAME", combo_name , "Times")
	gRecipeTimes = Cint(rtn_str)
	print "gRecipeTimes=", gRecipeTimes

	'SetVisionMarkData()

	rtn_str = db_file.get_db("Settings", "NAME", combo_name , "X")
	gRecipeCX = Cdbl(rtn_str)
	print "gRecipeCX=", gRecipeCX

	rtn_str = db_file.get_db("Settings", "NAME", combo_name , "Y")
	gRecipeCY = Cdbl(rtn_str)
	print "gRecipeCY=", gRecipeCY

	rtn_str = db_file.get_db("Settings", "NAME", combo_name , "BGA")
	gRecipeBGA = rtn_str
	print "gRecipeBGA=", gRecipeBGA
	rtn_str = Left(gRecipeBGA, 2)
	if rtn_str = "SH" then
		gRecipeIQC = 2
	else
		gRecipeIQC = 1
	end if
	
	db_file.close()	
End Sub
' ============
Sub GetRecipe(byval pt_no as integer, byref result as integer)
	Dim db_file as FileSystem
	Dim rtn as string
	Dim combo_name as string

	combo_name = gActiveProduct + "__" + gActiveRecipe
	' Attention!!!!!!!  pt_no is 1-based
	result = 0
	
	db_file.open(RECIPE_DB)
	rtn = db_file.get_db(combo_name, "rowid", pt_no , "X")	
	'print "rtn=", rtn
	if rtn <> "" then
		gRecipeX = Cdbl(rtn)
		print "gRecipeX[", pt_no, "]=", gRecipeX
	
		rtn = db_file.get_db(combo_name, "rowid", pt_no , "Y")		
		gRecipeY = Cdbl(rtn)
		print "gRecipeY[", pt_no, "]=", gRecipeY
	
		rtn = db_file.get_db(combo_name, "rowid", pt_no , "V")
		gRecipeV = Cdbl(rtn)
		print "gRecipeV[", pt_no, "]=", gRecipeV
	
		rtn = db_file.get_db(combo_name, "rowid", pt_no , "T")
		gRecipeT = Cint(rtn)
		print "gRecipeT[", pt_no, "]=", gRecipeT
	
		rtn = db_file.get_db(combo_name, "rowid", pt_no , "Z")
		gRecipeZ = Cdbl(rtn)
		print "gRecipeZ[", pt_no, "]=", gRecipeZ

		rtn = db_file.get_db(combo_name, "rowid", pt_no , "Vacuum")
		gRecipeVacuum = Cint(rtn)
		print "gRecipeVacuum[", pt_no, "]=", gRecipeVacuum

		rtn = db_file.get_db(combo_name, "rowid", pt_no , "Blow")
		gRecipeBlow = Cint(rtn)
		print "gRecipeBlow[", pt_no, "]=", gRecipeBlow
	else
		result = -1
	end if
	db_file.close()
End Sub
' ============
Sub CheckTipToCCD()
	'if (TIP_CCD_X > 45) or (TIP_CCD_X < 35) then
	'	MessagePopup(17)
	'	Stop
	'elseif (TIP_CCD_Y > 85) or (TIP_CCD_Y < 75) then
	'	MessagePopup(18)
	'	Stop
	'end if
End Sub
' ============
'Sub SetVisionMarkData
'	Dim x_sym as double
'	Dim y_sym as double
'	Dim z_sym as double
'	Dim side_sym as string
'	Dim mask_sym as integer
'	Dim idx as integer
'	Dim rtn as integer
	
'	if gPlatformSide = "A" then
'		gMarkName[0] = A_MARK[0]
'		gMarkName[1] = A_MARK[1]
'	elseif gPlatformSide = "B" then
'		gMarkName[0] = B_MARK[0]
'		gMarkName[1] = B_MARK[1]
'	else
'		print "Invalid Side"	
'	end if
	
'	'GetPCBXYZ(gMarkName[0], 1, x_sym, y_sym, z_sym, side_sym, mask_sym, rtn)
'	'if rtn = -1 then
'	'	MessagePopup(40)
'	'	stop
'	'end if
	
'	gPcbPointX[0] = x_sym
'	gPcbPointY[0] = y_sym
	
'	'GetPCBXYZ(gMarkName[1], 1, x_sym, y_sym, z_sym, side_sym, mask_sym, rtn)
'	'if rtn = -1 then
'	'	MessagePopup(40)
'	'	stop
'	'end if	
'	gPcbPointX[1] = x_sym
'	gPcbPointY[1] = y_sym
'End Sub
' ============
Sub CheckComponentExist(byval comp as string, byval pin as integer, byref exist as integer, byref ref_side as string)
	Dim rtn_x, rtn_y, rtn_z as double
	Dim rtn_side as string
	Dim rtn_mask as integer
	Dim rtn_result as integer
	GetPCBXYZ(comp, pin, rtn_x, rtn_y, rtn_z, rtn_side, rtn_mask, rtn_result)
	ref_side = rtn_side
	exist = rtn_result
End Sub
' ============
Sub GetPCBXYZ(byval comp as string, byval pin as integer, byref x_val as double, byref y_val as double, byref z_val as double, byref side_val as string, byref mask_val as integer, byref result as integer)
	Dim rtn_x as string
	Dim rtn_y as string
	Dim rtn_z as string
	Dim rtn_side as string
	Dim rtn_mask as string
	Dim com_db as FileSystem
	Dim pin_str as string
	Dim mod_rtn as integer
	Dim mask_ary(8) as string
	Dim idx as integer
	Dim cur_mask as string
	
	com_db.open("DB_Comp.db")
	pin_str = CStr(pin)

	rtn_x = com_db.get_db("TAB_Comp_PinPos", "Refdes", comp, "PIN", pin_str, "Sym_X")
	rtn_y = com_db.get_db("TAB_Comp_PinPos", "Refdes", comp, "PIN", pin_str, "Sym_Y")
	rtn_z = com_db.get_db("TAB_Comp_PinPos", "Refdes", comp, "PIN", pin_str, "Sym_Z")
	rtn_side = com_db.get_db("TAB_Comp_PinPos", "Refdes", comp, "PIN", pin_str, "Mirror")

	if (rtn_x ="") or (rtn_y ="") or (rtn_z ="") or (rtn_side="") then
		x_val = 0
		y_val = 0
		z_val = 0
		rtn_side = ""
		'ShortBuzzer(3)
		print "GetPCBXYZ-ERROR, comp=", comp, ",PIN=", pin, ",X=", rtn_x,", Y=", rtn_y,", Z=", rtn_z, ", SIDE=", rtn_side
		result = -1
	else		
		x_val = Cdbl(rtn_x)
		y_val = Cdbl(rtn_y)
		z_val = Cdbl(rtn_z)	
				
		print "GetPCBXYZ-OK, comp=", comp, ",PIN=", pin, ",X=", rtn_x,", Y=", rtn_y,", Z=", rtn_z, ", SIDE=", rtn_side
		if rtn_side = "0" then
			side_val = "A"
			result = 0
		elseif rtn_side = "1" then
			side_val = "B"
			result = 0
		else
			print "Wrong Side :", rtn_side
			'ShortBuzzer(3)
			result = -1
		end if			
	end if	
	com_db.close()	
End Sub
'============
'Sub CheckProductSN(byval product_sn as string)
'	Dim sn_slice as string
	
'	if (product_sn = "") or (product_sn = "FAIL") then 
'		'print "Read SN Fail..."
'		gProductName = PID_INVALID
'	else
'                sn_slice = Mid(product_sn,12,4)
'		'print "sn_slice =",sn_slice
'		if (sn_slice = "FGCC") or (sn_slice = "FGCD") or (sn_slice = "FGCF") then
'			print "This is Zagato with SM RF mode" 
'			gProductName = PID_ZAGATO
'		elseif (sn_slice = "F7GR") or (sn_slice = "F7GQ") or (sn_slice = "DYJP") then
'			print "This is Zagato with MMA RF mode" 
'			gProductName = PID_ZAGATO
'		elseif (sn_slice = "FN64") or (sn_slice = "FN63") or (sn_slice = "FN65") then
'			print "This is Zagato with MMB RF mode" 
'			gProductName = PID_ZAGATO
'		elseif (sn_slice = "FN61") or (sn_slice = "FN62") or (sn_slice = "FN68") then
'			print "This is Zagato with CHINA RF mode"
'			gProductName = PID_ZAGATO
'		elseif (sn_slice = "F7V1") or (sn_slice = "F7V2") or (sn_slice = "F4LR") then
'			print "This is Bertone with ALL RF mode" 
'			gProductName = PID_BERTONE
'		elseif (sn_slice = "FN77") or (sn_slice = "FN79") or (sn_slice = "FN78") then
'			print "This is Bertone with CHINA RF mode" 
'			gProductName = PID_BERTONE
'		elseif (sn_slice = "FGFD") or (sn_slice = "FGFF") or (sn_slice = "FGFC") then
'			print "This is Bertone with DTD RF mode" 
'			gProductName = PID_BERTONE
'		else
'			Print "Invalid SN"
'			gProductName = PID_INVALID
'		end if
'	end if	
'End Sub
' ============
Sub SaveTipCCD(byval arm_id as integer)', byval tip_ccd_x as double, byval tip_ccd_y as double)
	Dim ini_file as FileSystem
	Dim key_str as string
	Dim current_pos as position
	Dim tip_to_ccd_x as double
	Dim tip_to_ccd_y as double

	TakeArm arm_id
		current_pos = CurPos(arm_id)		
	GiveArm arm_id
	
	tip_to_ccd_x = gArmPointX[0] - PosX(current_pos)		 
	tip_to_ccd_y = gArmPointY[0] - PosY(current_pos)	

	'TIP_CCD_X[arm_id] = tip_to_ccd_x
	'TIP_CCD_Y[arm_id] = tip_to_ccd_y
	TIP_CCD_X = tip_to_ccd_x
	TIP_CCD_Y = tip_to_ccd_y	
	
	print "C104," + CStr(arm_id) + "," + CStr(tip_to_ccd_x) + "," + CStr(tip_to_ccd_y)
	ini_file.open("eq.ini")	
	ini_file.set_ini("arm", "tip_ccd_x", CStr(tip_to_ccd_x))
	ini_file.set_ini("arm", "tip_ccd_y", Cstr(tip_to_ccd_y))
	ini_file.close()
End Sub
' ============
Function IsValidProduct(byval p_name as string) as integer
	Dim ini_file as FileSystem
	Dim rtn_str as string
	Dim found as integer
	
	ini_file.open(PRODUCT_INI)
	rtn_str = ini_file.get_ini(p_name, "create_time")
	if rtn_str = "" then
		found = FALSE
	else
		found = TRUE
	end if
	ini_file.close()
	'Dim idx as integer
	
	'found = 0
	'for idx = 0 to 29
	'	if gProjectNames[idx] = p_name then
	'		found = 1
	'		break
	'	end if
	'next idx
	return found
End Function
' ============
Function IsValidRecipe(byval p_name as string, byval r_name as string) as integer
	Dim idx as integer
	Dim found as integer
	Dim rtn_str as string
	Dim db_file as FileSystem
	Dim combo_name as string

	found = IsValidProduct(p_name)
	
	if found = 1 then
		found = 0
		db_file.open(RECIPE_DB)
		combo_name = p_name + "__" + r_name
		rtn_str = db_file.get_db("Settings", "NAME", combo_name, "NAME")
		print "rtn_str=", rtn_str
		if rtn_str <> "" then
			found = 1
		else
			found = -2
		end if
	else
		found = -1
	end if

	return found ' -1: not valid product, -2 not valid recipe
End Function
