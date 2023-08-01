'==== VISION CONST ====
Const PATTERN = "1003"
Const TRACK = "1017"
Const CONTOUR_GROUP = "4"
Const GENERIC_GROUP = "0"
Const PATTERN_RECT = "2"

''==== GLOBAL ====
Dim net_server As NetServer
Dim net_slave As NetSlave
Dim vNet As NetSlave
Dim LastVisionTime As Double
Dim tester As Timer
Dim tt As Timer
Dim mytime1 As Timer
Dim mytime2 As Timer
Dim traj1 As Matrix
Dim curx,cury As Integer
Dim row,col As Integer
Dim io_flag As Integer
Dim tool_up[3] As Integer
Dim tool_down[3] As Integer
Dim tool_push[2] As Integer
Dim val_on[3] As Integer
Dim down_statue[3] As Integer
Dim encoder[3] As Double 
Dim int_count As Integer
Dim int_miss As Integer
Dim first_flag As Integer 
Dim my_filesystem As FileSystem
Dim my_filename As String
Dim my_row As String
Dim update_row As String
Dim update_title As String
Dim my_array[50] As String
Dim my_array1[50] As String
Dim length As Integer
Dim wait_statue As Integer
Dim check_statue As Integer
Dim conveyer_run_flag As Integer
Dim offline_flag As Integer
Dim first_again As Integer
Dim robot2_run As Integer
Dim my_time As Timer
Dim str_vision_array[10] As String
Dim dbl_vision_array[10] As Double
const vision_scale=1.5
Const init_flag = 24
Const run_flag = 25
Const check_flag = 27
Const put_ready = 26
Const load_ready = 32
'Const in_check = 15
const offline = 34
const robot2_single = 16
const reset_first_row = 33

Const run_status = 0 '0:vision  1:test  2:working
Program Main
    tool_down= (35,36,37)
'    tool_up = (41,43,45)
    tool_push = (47,46)
    val_on = (32,34,33)
     while TRUE
        SetDO 18
        Delay 200
        ReSetDO 18
        Delay 200
    wend
    SetCallBack Main_CallBack  
    
'    Wait robot2_single,HIGH           '等待2#机器人运行
    if getdi(robot2_single)= 1 then
        robot2_run = 1
    End if 
    
    select case run_status
    case 0
'        RunTask getenc1
        RunTask VisionTask
    case 1
        RunTask VisionTask
        RunTask track_proc()
    case 2
'	RunTask checkLoad
        RunTask communication_lianban   '收料机手动信号从第一排放起
        RunTask communication_offline   '收料机离线信号禁止放料
        RunTask Runstatus_Task          '运行状态
        RunTask Waitput_Task            '等待允许放料信号
        RunTask VisionTask
        RunTask track_proc
    End select
    while TRUE
        SetDO 18
        Delay 200
        ReSetDO 18
        Delay 200
    wend
End Program

Sub conveyer_run
    Dim real_pos,real_pos1 As Double
    real_pos=GetEnc(1)
    real_pos1=GetEnc(1)
    while 1
        real_pos=GetEnc(1)
'        Print "conveyer_run_flag=",real_pos
        if abs(real_pos1-real_pos)>5 then
            conveyer_run_flag=1
        else
            conveyer_run_flag=0
        End if
        real_pos1=real_pos
        Delay 200
'        print "conveyer_run_flag=",conveyer_run_flag
    wend
End Sub

Sub takegasoff
    ReSetDO val_on[0]
    ReSetDO val_on[1]
    ReSetDO val_on[2]
    SetDO tool_push[1]
    ReSetDO tool_push[0]
    Delay 500
    SetDO tool_push[0]
    ReSetDO tool_push[1]
End Sub
Sub getenc1
    while TRUE
        Print getenc(1)
        Delay 3000
    wend
End Sub
Sub read_file()    
'    my_filename="/home/ar/workspace/projects/init_row"
'    my_filesystem.open(my_filename)
'    my_row=my_filesystem.read()
'    my_array=split(my_row,",")
'    int_count = val(my_array[0])
'    int_miss = val(my_array[1])
''    int_count = 0
''    int_miss = 0
    my_filename="/home/ar/Desktop/1#数据统计"
    my_filesystem.open(my_filename)
    my_row=my_filesystem.read()
    my_array=split(my_row,chr(10))
    update_row = my_array[1]
    my_array1=split(update_row,chr(32))
    int_count = val(my_array1[0])
    int_miss = val(my_array1[10])
'    int_count = 0
'    int_miss = 0
End Sub

Sub takegason(byval index As integer)
    SetDO tool_push[0]
    ReSetDO tool_push[1]
    SetDO val_on[index]
End Sub

Sub take_tool_up
    SetDO tool_up[0]
    SetDO tool_up[1]
    SetDO tool_up[2]
    ReSetDO tool_down[0]
    ReSetDO tool_down[1]
    ReSetDO tool_down[2]
    Delay 100
End Sub

Sub Runstatus_Task
    while 1
        SetDO run_flag
        Delay 1000
        ReSetDO run_flag
        Delay 1000
    wend
End Sub

Sub VisionTask
    Dim buffer,old_buffer As String
    Dim maxtime,temp As Double
    Dim n As Integer
    Dim new_buffer As String
    maxtime = 0.0
    
'    vNet.init(1)
'    'set up pattern
'    vNet.trigger(0)
'    vNet.vsend(PATTERN, GENERIC_GROUP, PATTERN_RECT, "pattern132")
'    Delay 200
'    'turn on tracking
'    vNet.vsend(TRACK, CONTOUR_GROUP, "1")
'    Delay 100
'    vNet.trigger(1)
'    Delay 100
'    old_buffer = ""
    Dim imageid,shotid As Integer 
    shotid =0
    imageid = 0
'    while (robot2_run = 1)
    buffer = "HTTP/1.0 200 OK"
    buffer = buffer +"Content-type: application/x-javascript"
    buffer = buffer +"Connection: close"
    buffer = buffer +"Server: E-Motion-Streamer/14.02"
    buffer = buffer +"Cache-Control: no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0"
    buffer = buffer +"Pragma: no-cache"
    buffer = buffer +"Expires: Thu, 20 Feb 2014 14:32:32 GMT"
    buffer = buffer +"		"
    while TRUE
        
'        if buffer <> "" then
'            if ((buffer <> old_buffer) and (filter(buffer)>0)) then
''            if ((buffer <> old_buffer)) then
''                Print "buffer=",buffer
''                str_vision_array=split(buffer,",")
''                str_vision_array[2]=str(cdbl(str_vision_array[2])*vision_scale)
''                new_buffer=str_vision_array[0]+","+str_vision_array[1]+","+str_vision_array[2]+","
''                +str_vision_array[3]+","+str_vision_array[4]+","+str_vision_array[5]
''                Print "new_buffer=",new_buffer
''                SetTrackTarget new_buffer
'                SetTrackTarget buffer
'                old_buffer = buffer
'                Print old_buffer
'            End if
'        End if
        if mod(shotid,4) = 0 then
            imageid = imageid + 1
            buffer = buffer +"{"
            buffer = buffer +"pose: " + str(imageid) +",12.159718,3.912071,-0.199638,0," + str(shotid)
            buffer = buffer +"}"
            SetTrackTarget buffer
        End if 
        shotid = shotid + 1
        
'        Print "11111"
        Delay 100 
    wend  
End Sub

Sub checkLoad
    Dim loadtime As Timer
    Dim escape_time As Double
    Dim putStatus,first As Integer
    
    first = 0
    while 1
        putStatus = getdi(load_ready)
        if (putStatus = 0) and (first = 0) then
            loadtime.start()
            first = 1	   
        End if
        
        if first = 1 then
            escape_time = loadtime.end()
            if escape_time > 2.0 then
                vNet.trigger(0)
                Wait load_ready,HIGH
                vNet.trigger(1)
                first = 0
            End if
        End if
        Delay 100
    wend
End Sub

Sub Waitput_Task
    Dim putStatus As Integer
    while 1
        putStatus = getdi(load_ready)
        if putStatus = 1 then
            io_flag = 1
            Wait load_ready,LOW
        End if
'	io_flag = getdi(load_ready)
        Delay 100
    wend
End Sub

Sub track_proc()
    Dim startenc As Double
    Dim curenc As Double
    Dim dis As Double
    Dim cam_base As Position
    Dim motion_dir As Vector 
    Dim tool_pos[3,4] As Double
    Dim transf[4] As Double
    Dim Vision[7] As Double
    Dim conveyer_vel As Double
    Dim convyery_scale As Double 
    Dim track_time As Double
    Dim int_row,n As Integer 
    Dim goods As Integer
    Dim hasGrabber As Integer
    first_flag=1
    wait_statue = 0
    int_row = 0
    track_time = 0.01
    conveyer_vel = 300
'    convyery_scale = 88.920685
    convyery_scale = 61.310955
    motion_dir = (28.6294,-283.5970,0.4230)
    tool_pos[0] = (0,135,0.0,2.0)
    tool_pos[1] = (0.0,0.0,0.0,0.0)
    tool_pos[2] = (-10,-125.5,1.0,0.0)
    
    transf =(-0.062456,0.998048, 0.998048, -0.062456)
'    direction:(-9.1868,284.3359,-2.3309)
'    cam_base :(463.81,-759.43,235.10)
'    scale of conveyer:60.598856
    TakeArm 0
    Speed 100
    Accel 60
    Decel 60
    cam_base = P[17]
    take_tool_up()
    takegasoff()
    LetX cam_base = 295'25.3'12.7
    LetY cam_base = 350
    LetZ cam_base = 233
'    LetX cam_base = 285.77'31.1
'    LetY cam_base = 355
'    LetZ cam_base = 232
    SetTrackParam cam_base, motion_dir, conveyer_vel,-40.0,60.0,convyery_scale,tool_pos,track_time,transf
    DriveA 2,35.0,S=20
    Move L,@0,P[17],S=50
    ReSetDO 28
    Delay 500
    ReSetDO init_flag
    SetDO 28
    Delay 100
    ReSetDO 28
    SetDO init_flag
    goods = 0 
    
    while TRUE
'        int_row= 0
        hasGrabber = 0
'        for n = 0 to 2
'        Print "11"
        for n = 2 to 0 step -1
'            n = 0
'            Print "22"
            *lab:
            if n = 0 then  
                my_time.start()
'                ArchMove @E,P[20+n],10.0,S= 200 
                Move L,@0,P[24+n],S=200
'                Print "move_time=",my_time.end()
                if int_row = 2 then
                    
                    int_row = 0
                    first_flag = 1    
                    ReSetDO put_ready
                End if               
            else
                if n=1 then
                    Move L,@0,P[24+n],S=200
                else
                    ArchMove @0,P[24+n],15.0,S= 150
                End if
                if ((n=2) and (int_row = 1)) then
'                    Print  my_time.end()
                    int_row = 0
                End if
            End if           
            
            SetDO  tool_down[n]
'        ReSetDO tool_up[n]
'            SetDO val_on[n]
            takegason(n)
'            Wait  down_statue[n],HIGH
            Vision = GetTrackTarget(n)
            if (n = 1) and (int_row = 0) then
                ReSetDO put_ready
'                ReSetDO 44
'                Delay 10
'                if getdo(put_ready) = 0 then
'                    Print "1#复位put_ready完成!"
'                else
'                    Print "1#复位put_ready失败!"
'                    ReSetDO put_ready
'                End if
            End if
            if Vision[5] = 1 then
                int_miss = int_miss + 1
                Print "missing object :",Vision[6]
                goto *lab
            else
                Print "2222"
                TrackStart 0.0,tool_pos[n],0
                if n=2 then
                    my_time.start()
                End if
                hasGrabber = hasGrabber + 1
            End if        
            ReSetDO tool_down[n]
'            Pause
'        SetDO tool_up[n]    
        next n 
'        Delay 1000
'        Pause
        io_flag = 1
        if int_row >= 0 then
            do
                if (io_flag = 1) and (offline_flag = 0)then
                    break  
                End if
                wait_statue = 1
                Delay 100  
            loop
        End if  
        
        if first_again = 1 then          '重新从第一排开始放料
            int_row = 0
            first_again = 0
        End if
        
        wait_statue = 0
        int_row=0
        if hasGrabber > 0 then
            ArchMove @E,P[12+int_row],25.0,S= 150
            goods = goods + hasGrabber
            int_count = int_count + 3
'            Print "count=",int_count
'            Delay 100000
            Delay 50
'            Pause
            takegasoff()
            int_row = int_row + 1
        else 
'            SetDO check_flag
        End if
        
        if int_row = 1 then
            io_flag =0
            SetDO put_ready
'            SetDO 44
'            Delay 10
'            if getdo(put_ready) = 1 then
'                Print "1#放料完成,已置位put_ready！"
'            else
'                Print "1#放料完成,置位put_ready失败！"
'                ReSetDO put_ready
'                Delay 100
'                SetDO put_ready
'                Delay 20
'                if getdo(put_ready) = 1 then
'                    Print "再次置位put_ready完成！"
'                else
'                    Print "再次置位put_ready失败,请手动置位！"
'                End if
'            End if   
        End if
    wend    
    GiveArm 0
End Sub
Sub callnextindex() 
    if cury = (col - 1)   then
        cury = 0
        curx = curx + 1
    else
        cury = cury + 1
    End if  
    if curx = row  then
        curx = 0
    End if 
End Sub
Sub reset_all_output()
    Dim aa As Integer
    for aa = 0 to 2 
        SetDO tool_up[aa]
        ReSetDO tool_down[aa]
        ReSetDO val_on[aa]
    next aa    
End Sub
Sub save_data()
    my_filename="/home/ar/Desktop/1#数据统计"
    my_filesystem.open(my_filename)
    update_title = "1#生产总数" + "    " + "漏料数"
    update_row = str(int_count) + "          "  + str(int_miss)
    my_filesystem.save(update_title)
    my_filesystem.append(update_row)
End Sub
Sub Main_CallBack(Byval state As integer)
    if state = STP then
        vNet.trigger(0)
'        take_tool_up() 
        'turn off tracking
'        vNet.vsend(TRACK, CONTOUR_GROUP, "0")
'        vNet.stop()
        save_data()
        reset_all_output()
'        takegasoff()
        ReSetDO init_flag
        ReSetDO run_flag
        ReSetDO put_ready
        ReSetDO robot2_single   
        Print "exit program"	       
    End if
End Sub

Sub communication_lianban
    while 1 
        if getdi(reset_first_row) = 1 then
            first_again = 1 
            Wait reset_first_row,LOW
'            first_again = 0
        End if
        Delay 10
    wend
End Sub
Sub communication_offline
    while 1 
        if getdi(offline) = 1 then
            offline_flag = 1
            Wait offline,LOW
            offline_flag = 0
        End if
        Delay 10
    wend
End Sub
Function filter(byval str_buffer As string) As Integer
    Dim array[10] As String
    array=split(str_buffer,",")
'print "array[0]+array[1]+array[2]+array[3]="+str(array[0])+" "+str(array[1])+" "+str(array[2])+" "+str(array[3])
    if ((abs(cdbl(array[3]))<20) and (abs(cdbl(array[1]))<60))then
        return 1
    else
        return 0
    End if
    
End Function

Function filter_data(byval buffer1 As String )as Integer
'    const SPAN_TIME=1.45
    const SPAN_TIME=1.1
    Dim args1[6] As String
    Dim x1,time1,newTime As Double
    args1=split(buffer1,",")
'    return 1
    x1=cdbl(args1[1])
    time1=cdbl(args1[4])
'    x1=val(args1[1])
'    time1=val(args1[4])
'    x1=1.0
'    time1=2.0
    
    newTime=time1+x1/400.0
    if (newTime-LastVisionTime>SPAN_TIME) then
        LastVisionTime=newTime     
        return 1
    End if
    return 0   
End Function