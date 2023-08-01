Sub LinearityTest()
	Dim arm_id as integer
	Dim target_pos as position
	Dim dest as double
	Dim cur_posX as double
	Dim cur_posY as double
	Dim cur_posZ as double
	Dim interval as double
	Dim idx as integer
	Dim tmp_pos as double
	Dim err1 as double
	Dim err2 as double
	Dim axis_no as integer
	Dim final_idx as integer
	
	Dim print_msg as string

	' ==== define which axis need to be test ============
	arm_id=G010

	print "LinearityTest-ARM0"
		
	axis_no=G011
	if axis_no=0 then
		print "LinearityTest-X"
	elseif axis_no=1 then
		print "LinearityTest-Y"
	elseif axis_no=2 then
		print "LinearityTest-Z"
	else
		print "Invalid G011"
		stop
	end if
	
	'arm_id = 0   '  0  <-- ARM0 , 1 <-- ARM1
	'axis_no = 0  '  0  <-- xaxis , 1 <-- yaxis , 2 <-- zaxis
	'======================================
	
	idx =0

	'if (arm_id = 0) and (axis_no=0) then
	'	interval = -10.0		
	'else
		interval = 10.0
	'end if
	print "interval = ", interval
	
	' arm0X : 0 ~ 330
	' arm0Y : 0 ~ 270
	' arm1X : 0 ~ 160
	' arm1Y : 0 ~ 190
	
	TakeArm arm_id

	' --- Test axis linearity from current position
		target_pos = CurPos(arm_id)	
		cur_posX = PosX(target_pos)
		cur_posY = PosY(target_pos)
		cur_posZ = PosZ(target_pos)
		print "cur_posX =", cur_posX
		print "cur_posY =", cur_posY
		print "cur_posZ =", cur_posZ
		
	if axis_no = 0 then
		' X-axis
		final_idx = 28
	elseif axis_no = 1 then
		' Y-axis
		final_idx = 39
		'final_idx = 10
	else
		' Z-axis TBD
		final_idx = 18
		interval = 5.0
	end if
	
	for idx = 0 to final_idx
		tmp_pos = interval*idx
		
		if axis_no = 0 then
			dest = cur_posX+tmp_pos
			LetX target_pos = dest
		elseif axis_no = 1 then		
			dest = cur_posY+tmp_pos
			LetY target_pos = dest
		else
			dest = cur_posZ-tmp_pos
			LetZ target_pos = dest
		end if
		
		delay 3000
		Move P,@E,target_pos,S=20
		delay 3000
	next idx
		
	do
		tmp_pos = interval*idx
		if axis_no = 0 then
			dest =cur_posX+tmp_pos
			LetX target_pos = dest
		elseif axis_no = 1 then
			dest =cur_posY+tmp_pos
			LetY target_pos = dest
		else
			dest =cur_posZ-tmp_pos
			LetZ target_pos = dest
		end if
		
		delay 3000
		Move P,@E,target_pos,S=20
		delay 3000
		idx = idx -1
		if idx <0 then 
			break
		end if
	loop
	
	print "Test Compelete !!!"	
	GiveArm arm_id
End Sub